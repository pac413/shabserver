import mime from 'mime'
import { v4 as uuid } from 'uuid'
import models from 'Models'
import { AWS } from 'Services'
import {
  AVATAR_THUMBNAILS,
  PICTURE_THUMBNAILS,
  ATTACHMENT_THUMBNAILS,
  VIDEO_THUMBNAILS,
  DEFAULT_SHABBAT_PROFILE_S3_KEY,
} from 'Utils/globals'
import { uploadRemoteFile, copyS3Object } from 'Utils/upload'
import { MediaStatus, MediaSubType, MediaType } from 'Models/media/enums'
import { updateMediaOwner } from 'Connectors/media/confirmAndProcessUploadedMedia'

export const generateMediaPublicUrl = (mediaId, params = {}) => {
  const queryString = Object.keys(params)
    .map((key) => `${key}=${params[key]}`)
    .concat(['accessToken={accessToken}'])
    .join('&')
  return `${process.env.SERVER_URL}/media/${mediaId}?${queryString}`
}

export const sendMediaProcessSQSMessage = async (params) => {
  const {
    _id,
    mediaType,
    mediaSubType,
    bucket,
    fileExt,
    ownerId,
    mimetype,
    s3Key,
    reference,
  } = params
  const sqs = AWS.getSQSClient()
  const sqsParams = {
    QueueUrl: AWS.getMediaSQSQueueUrl(),
    MessageBody: _id,
    MessageAttributes: {
      mediaType: { DataType: 'String', StringValue: mediaType },
      mediaSubType: { DataType: 'String', StringValue: mediaSubType },
      bucket: { DataType: 'String', StringValue: bucket },
      fileExt: { DataType: 'String', StringValue: fileExt },
      mimetype: { DataType: 'String', StringValue: mimetype },
      s3Key: { DataType: 'String', StringValue: s3Key },
      ownerId: { DataType: 'String', StringValue: ownerId },
      reference: { DataType: 'String', StringValue: JSON.stringify(reference) },
    },
  }
  return new Promise((resolve, reject) => {
    sqs.sendMessage(sqsParams, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data)
    })
  })
}

export const getMediaThumbnailList = (mediaType, mediaSubType) => {
  if (mediaType === MediaType.PICTURE) {
    switch (mediaSubType) {
      case MediaSubType.AVATAR:
        return AVATAR_THUMBNAILS
      case MediaSubType.PROFILE:
        return PICTURE_THUMBNAILS
      case MediaSubType.POST:
      case MediaSubType.COMMENT:
      case MediaSubType.COMMENT_REPLY:
      case MediaSubType.MESSAGE:
        return ATTACHMENT_THUMBNAILS
      default:
        return []
    }
    // eg. We can define { w, h } for size if needed
    // [MediaSubType.WALLPAPER]: [
    //   { name: 'thumbnail', size: { w: 200, h: 100 } },
    // ],
  } else if (mediaType === MediaType.VIDEO) {
    return VIDEO_THUMBNAILS
  }
  return []
}

export const checkIfMediaIsPublic = (mediaType, mediaSubType) => {
  if (mediaType === MediaType.PICTURE && mediaSubType === MediaSubType.AVATAR) {
    return true
  }
  return false
}

export const uploadMediaFromUrl = async (
  mediaUrl,
  profileId,
  mediaType,
  mediaSubType,
  mediaKey = '',
  socialProvider = false
) => {
  const mediaUuid = uuid()
  const ownerId = profileId || DEFAULT_SHABBAT_PROFILE_S3_KEY
  const bucket = AWS.awsS3Bucket
  const mimetype = socialProvider ? 'image/jpeg' : mime.getType(mediaUrl)
  const fileExt = mime.getExtension(mimetype)
  if (!fileExt) {
    throw new Error(`File is unsupported version ${mediaUrl} ${mimetype}`)
  }

  const s3Key = AWS.generateMediaS3Key({
    mediaType,
    mediaSubType,
    ownerId,
    id: mediaKey || mediaUuid,
    fileExt,
  })
  const isPublic = !profileId || checkIfMediaIsPublic(mediaType, mediaSubType) // default avatars, wallpapers will be public
  // Upload file unless it doesn't exist on s3 (import process)
  const s3 = AWS.getS3Client()
  try {
    await s3
      .headObject({
        Bucket: bucket,
        Key: s3Key,
      })
      .promise()
    console.info(`Media: ${mediaUrl} already exists on s3`)
  } catch (headErr) {
    if (headErr.code === 'NotFound') {
      try {
        console.info(`Uploading a media: ${mediaUrl} to s3`)
        await uploadRemoteFile(mediaUrl, s3Key, isPublic)
        console.info(`Finished uploading a media: ${mediaUrl} to s3`)
      } catch (error) {
        throw new Error(`Failed to upload media: ${mediaUrl} to s3`)
      }
    }
  }
  return s3Key
}

export const createMedia = async ({
  mediaUrl,
  profileId,
  mediaType,
  mediaSubType,
  reference,
  mediaKey, // s3 object key
  socialProvider,
  importedAt,
}) => {
  const mediaUuid = uuid()
  const s3ObjectId = mediaKey || mediaUuid
  const ownerId = profileId || DEFAULT_SHABBAT_PROFILE_S3_KEY
  const mimetype =
    (socialProvider ? 'image/jpeg' : mime.getType(mediaUrl)) || 'image/jpeg'
  const bucket = AWS.awsS3Bucket
  const fileExt = mime.getExtension(mimetype)
  const isPublic = !profileId || checkIfMediaIsPublic(mediaType, mediaSubType) // default avatars, wallpapers are public

  const s3Key = AWS.generateMediaS3Key({
    mediaType,
    mediaSubType,
    ownerId,
    id: s3ObjectId,
    fileExt,
  })
  const mediaParams = {
    _id: mediaUuid,
    mediaType,
    mediaSubType,
    ownerId,
    mimetype,
    originalFilename: mediaUrl,
    s3Key,
    originalUrl: isPublic
      ? AWS.getCfPublicUrl(s3Key)
      : generateMediaPublicUrl(mediaUuid),
    reference,
    importedAt,
  }
  const media = await models.Media.create({
    status: MediaStatus.UPLOADED,
    thumbnails: [],
    ...mediaParams,
  })
  if ([MediaSubType.AVATAR, MediaSubType.WALLPAPER].includes(mediaSubType)) {
    updateMediaOwner(media)
  }

  await sendMediaProcessSQSMessage({
    ...mediaParams,
    bucket,
    fileExt,
  })
  return media
}

export const cloneMedia = async ({
  sourceMedia, // source Media object
  profileId,
  mediaType,
  mediaSubType,
  reference = {},
  mediaKey, // s3 object key
  socialProvider,
  importedAt,
}) => {
  const fileExt = mime.getExtension(sourceMedia.mimetype)

  // Generate s3 key for the cloned media
  const clonedMediaS3Key = AWS.generateMediaS3Key({
    mediaType,
    mediaSubType,
    ownerId: profileId,
    id: mediaKey,
    fileExt,
  })

  // Clone s3 object
  await copyS3Object(sourceMedia.s3Key, clonedMediaS3Key, false)

  // Create a new Media object
  const media = await createMedia({
    mediaUrl: sourceMedia.originalFilename,
    profileId,
    mediaType,
    mediaSubType,
    reference,
    mediaKey,
    socialProvider,
    importedAt,
  })

  return media
}

export const uploadToS3 = async (
  mediaType,
  mediaSubType,
  ownerId,
  s3KeyId,
  fileExt,
  mimetype,
  buff
) => {
  const isPublic = checkIfMediaIsPublic(mediaType, mediaSubType)
  const s3Key = AWS.generateMediaS3Key({
    mediaType,
    mediaSubType,
    ownerId,
    id: s3KeyId,
    fileExt: fileExt,
  })
  const params = {
    Bucket: AWS.awsS3Bucket,
    Key: s3Key,
    ACL: isPublic ? 'public-read' : 'bucket-owner-full-control',
    ContentType: mimetype,
    Body: buff,
  }
  const s3 = AWS.getS3Client()
  await s3.putObject(params).promise()
  return s3Key
}
