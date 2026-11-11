import { MediaSubType, MediaType } from 'Models/media/enums'
import { DEFAULT_WALLPAPER } from 'Utils/globals'
import { createMedia } from 'Utils/media'

const importDefaultWallpapers = async () => {
  console.log('creating default wallpapers')
  return createMedia({
    mediaUrl: DEFAULT_WALLPAPER,
    profileId: '',
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.WALLPAPER,
    reference: {},
    mediaKey: `default_wallpaper`,
    socialProvider: false,
  })
}

export const runFeatureImport = async () => {
  await importDefaultWallpapers()
  console.log('imported features')
}
