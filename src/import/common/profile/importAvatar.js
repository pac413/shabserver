import { parseMigratedDate } from 'Import/common/helpers'
import { importMedia } from 'Import/common/media/importMedia'
import { MediaSubType, MediaType } from 'Models/media/enums'

export const importAvatar = async (data, profile, importedAt) => {
  const { original, createdAt, updatedAt, ...thumbnails } = data.avatar
  console.log({
    event: 'IMPORT_PROFILE_AVATAR',
    message: `Starting to import avatar for ${profile._id}`,
    profileId: profile._id,
  })

  if (!original) {
    console.log({
      event: 'PROFILE_AVATAR',
      message: `Avatar for ${profile._id} is not defined`,
      profileId: profile._id,
    })
    return null
  }

  const avatar = await importMedia(
    {
      original,
      ownerId: profile._id,
      mediaType: MediaType.PICTURE,
      mediaSubType: MediaSubType.AVATAR,
      reference: {},
      mediaKey: 'avatar',
      socialProvider: false,
      thumbnails,
      createdAt: parseMigratedDate(createdAt) || importedAt,
      updatedAt: parseMigratedDate(updatedAt) || importedAt,
    },
    importedAt
  )

  console.log({
    event: 'PROFILE_AVATAR',
    message: `Completed to import avatar for ${profile._id}`,
    profileId: profile._id,
  })
  return avatar
}
