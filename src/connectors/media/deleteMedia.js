import * as Sentry from '@sentry/node'
import { updateProfile } from 'Connectors/profile'
import { eventManager } from 'Events'
import models from 'Models'
import { FlaggedContentType } from 'Models/flaggedContent/enums'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { AWS } from 'Services'
import { deleteFlaggedContentsForResource } from 'Utils/admin'

const deleteMediaById = async (id) => {
  const media = await models.Media.findById(id)

  // delete media resources from s3
  const s3 = AWS.getS3Client()
  const bucket = AWS.awsS3Bucket
  const params = []

  params.push({
    Bucket: bucket,
    Key: media.s3Key,
  })
  media.thumbnails.forEach(({ s3Key }) =>
    params.push({
      Bucket: bucket,
      Key: s3Key,
    })
  )
  try {
    await Promise.all(params.map((param) => s3.deleteObject(param)))
  } catch (error) {
    console.error('Error to delete s3 objects: ', error)
    Sentry.captureException(error)
  }

  // delete media document from database
  await models.Media.deleteOne({ _id: id })

  // update profile if this media is avatar or wallpaper
  const updateProfileInput = (() => {
    if (media.mediaType === MediaType.PICTURE) {
      if (media.mediaSubType === MediaSubType.AVATAR) {
        return { avatar: null }
      } else if (media.mediaSubType === MediaSubType.WALLPAPER) {
        return { wallpaper: null }
      }
    }
    return null
  })()
  if (updateProfileInput) {
    await updateProfile(updateProfileInput, {
      profileId: media.ownerId,
    })
  }
}

export default async function deleteMedia({ id, keepOriginal }) {
  const media = await models.Media.findById(id)
  if (!media) {
    return
  }
  const tasks = []
  tasks.push(deleteMediaById(id))
  // If this media is a profile picture, we need to remove its original media
  if (
    media.mediaType === MediaType.PICTURE &&
    media.mediaSubType === MediaSubType.PROFILE &&
    media.reference &&
    media.reference.originalMediaId &&
    !keepOriginal
  ) {
    tasks.push(deleteMediaById(media.reference.originalMediaId))
  }
  await Promise.all(tasks)

  // Clean up the related flagged contents for this media
  const type = (() => {
    if (
      media.mediaType === MediaType.PICTURE &&
      media.mediaSubType === MediaSubType.PROFILE
    ) {
      return FlaggedContentType.MEDIA_PROFILE_PICTURE
    } else if (
      media.mediaType === MediaType.PICTURE &&
      media.mediaSubType === MediaSubType.AVATAR
    ) {
      return FlaggedContentType.MEDIA_AVATAR
    }
    return null
  })()
  await deleteFlaggedContentsForResource(id, type)

  // emit MEDIA_DELETED event
  eventManager.emit(eventManager.events.MEDIA_DELETED, {
    media,
    event: eventManager.events.MEDIA_DELETED,
  })
}
