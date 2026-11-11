import mime from 'mime'
import { v4 as uuid } from 'uuid'
import { AWS } from 'Services'
import { checkIfMediaIsPublic } from 'Utils/media'

export default async function getMediaUploadUrl(input, { activeProfileId }) {
  const {
    filename,
    mediaType,
    mediaSubType,
    mimetype,
    profileId = activeProfileId,
  } = input
  const mediaUuid = uuid()
  const fileExt = mimetype
    ? mime.getExtension(mimetype)
    : mime.getType(filename)
  if (!fileExt) {
    throw new Error('File is unsupported version')
  }

  const isPublic = checkIfMediaIsPublic(mediaType, mediaSubType)
  const s3 = AWS.getS3Client()
  const params = {
    Bucket: AWS.awsS3Bucket,
    Expires: process.env.AWS_PRESIGNED_URL_EXPIRATION,
    Key: AWS.generateMediaS3Key({
      mediaType,
      mediaSubType,
      ownerId: profileId,
      id: mediaUuid,
      fileExt,
    }),
    ACL: isPublic ? 'public-read' : 'bucket-owner-full-control',
    ContentType: mimetype,
  }

  const preSignedUrl = await s3.getSignedUrlPromise('putObject', params)
  return { id: mediaUuid, url: preSignedUrl }
}
