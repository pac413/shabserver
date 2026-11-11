import mime from 'mime'
import models from 'Models'
import { MediaSubType, MediaType, MediaStatus } from 'Models/media/enums'
import { AWS } from 'Services'
import { sendMediaProcessSQSMessage } from 'Utils/media'

export default async function createMediaForPictureAddedPost({
  postId,
  media,
}) {
  const { originalMediaId } = media.reference || {}
  const postMedia = await models.Media.create({
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.POST,
    ownerId: media.ownerId,
    mimetype: media.mimetype,
    originalFilename: media.originalFilename,
    s3Key: media.s3Key,
    originalUrl: media.originalUrl,
    status: MediaStatus.UPLOADED,
    meta: media.meta,
    reference: {
      originalMediaId,
      postId,
    },
  })

  // send a new message to sqs queue to process this media
  const bucket = AWS.awsS3Bucket
  const fileExt = mime.getExtension(media.mimetype)
  await sendMediaProcessSQSMessage({
    ...postMedia.toObject(),
    bucket,
    fileExt,
  })
  return postMedia
}
