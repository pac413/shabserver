import { deleteMedia } from 'Connectors/media'
import { parseMigratedDate } from 'Import/common/helpers'
import { importMedia } from 'Import/common/media/importMedia'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const importProfilePicture = async (index, data, profile, importedAt) => {
  const { original, isAvatar, createdAt, updatedAt, ...thumbnails } = data
  console.log({
    event: 'IMPORT_PROFILE_PICTURE',
    message: `Importing picture ${original} for ${profile._id}`,
    profileId: profile._id,
  })

  const picture = await importMedia(
    {
      original,
      ownerId: profile._id,
      mediaType: MediaType.PICTURE,
      mediaSubType: MediaSubType.PROFILE,
      reference: {},
      mediaKey: `picture${index}`,
      socialProvider: false,
      thumbnails,
      createdAt: parseMigratedDate(createdAt) || importedAt,
      updatedAt: parseMigratedDate(updatedAt) || importedAt,
    },
    importedAt
  )

  return picture
}

const removeOldProfilePictures = async (data, profile) => {
  const originals = data.pictures
    .filter((picture) => picture.original && !picture.isAvatar)
    .map((picture) => picture.original)

  const medias = await models.Media.find({
    original: { $nin: originals },
    ownerId: profile._id,
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.PROFILE,
  })
    .select({})
    .lean()

  await Promise.all(
    medias.map((media) =>
      deleteMedia({ id: media._id, keepOriginal: IS_MOCK_IMPORT })
    )
  )
}

export const importProfilePictures = async (data, profile, importedAt) => {
  data.pictures = data.pictures || []
  console.log({
    event: 'IMPORT_PROFILE_PICTURES',
    message: `Starting to import ${data.pictures.length} profile pictures for ${profile._id}`,
    profileId: profile._id,
  })
  await removeOldProfilePictures(data, profile)

  // Create media documents for profile pictures
  await Promise.all(
    data.pictures.map((picture, index) => {
      if (!picture.original || picture.isAvatar) {
        return profile
      }
      return importProfilePicture(index, picture, profile, importedAt)
    })
  )
  console.log({
    event: 'PROFILE_PICTURE',
    message: `Completed to import ${data.pictures.length} profile pictures for ${profile._id}`,
    profileId: profile._id,
  })
}
