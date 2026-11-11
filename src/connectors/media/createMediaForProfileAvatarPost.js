import mime from 'mime'
import models from 'Models'
import { MediaSubType, MediaType, MediaStatus } from 'Models/media/enums'
import { AWS } from 'Services'
import { sendMediaProcessSQSMessage } from 'Utils/media'

export default async function createMediaForProfileAvatarPost(profile, postId) {
  const avatarMedia = await models.Media.findById(profile.avatar).lean()
  if (!avatarMedia) {
    return null
  }

  const postMedia = await models.Media.create({
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.POST,
    ownerId: avatarMedia.ownerId,
    mimetype: avatarMedia.mimetype,
    originalFilename: avatarMedia.originalFilename,
    s3Key: avatarMedia.s3Key,
    originalUrl: avatarMedia.originalUrl,
    status: MediaStatus.UPLOADED,
    meta: avatarMedia.meta,
    reference: {
      originalMediaId: profile.avatar,
      postId,
    },
  })

  // send a new message to sqs queue to process this media
  const bucket = AWS.awsS3Bucket
  const fileExt = mime.getExtension(avatarMedia.mimetype)
  await sendMediaProcessSQSMessage({
    ...postMedia.toObject(),
    bucket,
    fileExt,
  })
  return postMedia
}
