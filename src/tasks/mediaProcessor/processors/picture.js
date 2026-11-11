import Jimp from 'jimp'
import { AWS } from 'Services'
import models from 'Models'
import { MediaStatus } from 'Models/media/enums'
import {
  generateMediaPublicUrl,
  getMediaThumbnailList,
  checkIfMediaIsPublic,
  uploadToS3,
} from 'Utils/media'

export const processPicture = async (id, messageObj) => {
  const { mediaType, mediaSubType } = messageObj

  const thumbnailSizes = getMediaThumbnailList(mediaType, mediaSubType)
  if (!thumbnailSizes.length) {
    console.info(`Media: ${id} does not need any thumbnail yet`)
    return
  }

  try {
    await models.Media.updateOne(
      { _id: id },
      {
        $set: {
          status: MediaStatus.PROCESSING,
        },
      }
    )
  } catch (err) {
    console.error('Media model update error: ', err)
    return
  }

  let thumbnails = []
  try {
    thumbnails = await Promise.all(
      thumbnailSizes.map((sizeInfo) => uploadThumbnail(messageObj, sizeInfo))
    )
  } catch (err) {
    console.error('Image upload error: ', err)
    throw err
  }

  try {
    await models.Media.updateOne(
      { _id: id },
      {
        $set: {
          status: MediaStatus.COMPLETED,
          thumbnails,
        },
      }
    )
  } catch (err) {
    console.error('Media model update error: ', err)
    throw err
  }
}

const uploadThumbnail = async (messageObj, sizeInfo) => {
  const { mediaType, mediaSubType, bucket, id, s3Key, ownerId } = messageObj
  const { name, size } = sizeInfo
  // Generate thumbnail
  const s3 = AWS.getS3Client()
  const signedUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket: bucket,
    Key: s3Key,
    Expires: 360,
  })
  const width = size.w ? size.w : size
  const height = size.h ? size.h : size
  const jimpImage = await Jimp.read(signedUrl)
  await jimpImage.resize(width, height)
  console.info(`Generated a thumbnail: ${name}, Uploading it to s3`)
  // Upload thumbnail to s3 in png format
  const thumbnailBuff = await jimpImage.getBufferAsync('image/png')
  const thumbnailS3Key = await uploadToS3(
    mediaType,
    mediaSubType,
    ownerId,
    `${id}_${name}`,
    'png',
    'image/png',
    thumbnailBuff
  )
  console.info(`Finished uploading a thumbnail: ${name} of media: ${id} to s3`)

  const isPublic = checkIfMediaIsPublic(mediaType, mediaSubType)
  return {
    ...sizeInfo,
    s3Key: thumbnailS3Key,
    url: isPublic
      ? AWS.getCfPublicUrl(thumbnailS3Key)
      : generateMediaPublicUrl(id, { thumbnail: name }),
  }
}
