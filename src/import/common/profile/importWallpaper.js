import { parseMigratedDate } from 'Import/common/helpers'
import { importMedia } from 'Import/common/media/importMedia'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { DEFAULT_SHABBAT_WALLPAPER_PREFIX } from 'Utils/globals'

export const importWallpaper = async (data, profile, importedAt) => {
  console.log({
    event: 'IMPORT_PROFILE_WALLPAPER',
    message: `Starting to import wallpaper for ${profile._id}`,
    profileId: profile._id,
  })
  // wallpaper doesn't have thumbnails
  const { original, createdAt, updatedAt } = data.wallpaper
  // Create a media document for wallpaper
  if (!original || original.includes(DEFAULT_SHABBAT_WALLPAPER_PREFIX)) {
    console.log({
      event: 'PROFILE_WALLPAPER',
      message: `Wallpaper for ${profile._id} is not defined`,
      profileId: profile._id,
    })
    data.wallpaper = null
    return null
  }

  const wallpaper = await importMedia(
    {
      original: original,
      ownerId: profile._id,
      mediaType: MediaType.PICTURE,
      mediaSubType: MediaSubType.WALLPAPER,
      reference: {},
      mediaKey: 'wallpaper',
      socialProvider: false,
      thumbnails: {},
      createdAt: parseMigratedDate(createdAt) || importedAt,
      updatedAt: parseMigratedDate(updatedAt) || importedAt,
    },
    importedAt
  )

  console.log({
    event: 'PROFILE_WALLPAPER',
    message: `Completed to import wallpaper for ${profile._id}`,
    profileId: profile._id,
  })
  return wallpaper
}
