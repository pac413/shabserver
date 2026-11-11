import { MediaSubType, MediaType } from 'Models/media/enums'
import { DEFAULT_WALLPAPER } from 'Utils/globals'
import { uploadMediaFromUrl } from 'Utils/media'

export const importDefaultMedia = async () => {
  const promises = []
  // upload default wallpapers
  promises.push(
    uploadMediaFromUrl(
      DEFAULT_WALLPAPER,
      '',
      MediaType.PICTURE,
      MediaSubType.WALLPAPER,
      `default_wallpaper`
    )
  )
  try {
    await Promise.all(promises)
    console.info({
      event: 'DEFAULT_MEDIA',
      message: 'imported default media resources succesfully',
    })
  } catch (err) {
    console.error({
      event: 'DEFAULT_MEDIA',
      message: 'imported default media resources with error',
      err,
    })
  }
}
