import { deleteMedia } from 'Connectors/media'
import models from 'Models'
import { MediaSubType } from 'Models/media/enums'
import { IS_MIGRATE, IS_MOCK_IMPORT } from 'Utils/globals'
import { createMedia, uploadMediaFromUrl } from 'Utils/media'

const findExisting = async (data) => {
  let media
  if (
    [MediaSubType.AVATAR, MediaSubType.WALLPAPER].includes(data.mediaSubType)
  ) {
    media = await models.Media.findOne({
      ownerId: data.ownerId,
      mediaType: data.mediaType,
      mediaSubType: data.mediaSubType,
    })
  } else {
    media = await models.Media.findOne({
      originalFilename: data.original,
      ownerId: data.ownerId,
      mediaType: data.mediaType,
      mediaSubType: data.mediaSubType,
    })
  }
  return media
}

const uploadMedia = async (data) => {
  const { mediaType, mediaSubType, mediaKey, original, ownerId, thumbnails } =
    data

  if (IS_MIGRATE) {
    const promises = []
    promises.push(
      uploadMediaFromUrl(
        original,
        ownerId,
        mediaType,
        mediaSubType,
        mediaKey
      ).catch((err) => {
        console.error({
          event: 'MEDIA',
          message: 'Failed to upload original media',
          err,
          ownerId,
          mediaType,
          mediaSubType,
          mediaKey,
        })
      })
    )

    Object.keys(thumbnails).forEach((key) => {
      promises.push(
        uploadMediaFromUrl(
          thumbnails[key],
          ownerId,
          mediaType,
          mediaSubType,
          `${mediaKey}_${key}`
        ).catch((err) => {
          console.error({
            event: 'MEDIA',
            message: `Failed to upload ${key} media`,
            err,
            ownerId,
            mediaType,
            mediaSubType,
            mediaKey,
          })
        })
      )
    })

    await Promise.all(promises)
  }
}

const create = async (data, importedAt) => {
  const {
    mediaType,
    mediaSubType,
    mediaKey,
    original,
    ownerId,
    socialProvider,
    reference,
  } = data

  if (!original) {
    return null
  }

  await uploadMedia(data)

  const media = await createMedia({
    mediaUrl: original,
    profileId: ownerId,
    mediaType,
    mediaSubType,
    reference,
    mediaKey,
    socialProvider,
    importedAt,
  })

  return media
}

const update = async (data, media, importedAt) => {
  const lastModified = data.updatedAt ? new Date(data.updatedAt) : null
  const newImportedAt = new Date(importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    return media
  }

  // If the media original url is the same, no need to re-import
  if (media.originalFilename === data.original) {
    await uploadMedia(data)
    await models.Media.updateOne({ _id: media._id }, { importedAt })
    return media
  }

  await deleteMedia({ id: media._id, keepOriginal: IS_MOCK_IMPORT })
  const newWallpaper = await create(data, importedAt)

  return newWallpaper
}

export const importMedia = async (data, importedAt) => {
  const { ownerId, mediaType, mediaSubType, mediaKey } = data
  console.log({
    event: 'IMPORT_MEDIA',
    message: `Importing media for ${data.ownerId}`,
    profileId: data.ownerId,
    data,
  })

  const existing = await findExisting(data)
  let media
  if (existing) {
    media = await update(data, existing, importedAt)
    if (media) {
      console.log({
        event: 'MEDIA',
        action: 'Updated',
        message: `Updated media for ${ownerId}`,
        ownerId,
        mediaType,
        mediaSubType,
        mediaKey,
      })
    } else {
      console.log({
        event: 'MEDIA',
        action: 'Deleted',
        message: `Deleted media ${ownerId}`,
        ownerId,
        mediaType,
        mediaSubType,
        mediaKey,
      })
    }
  } else {
    media = await create(data, importedAt)
    if (media) {
      console.log({
        event: 'MEDIA',
        action: 'Created',
        message: `Created media ${ownerId}`,
        ownerId,
        mediaType,
        mediaSubType,
        mediaKey,
      })
    }
  }

  return media
}
