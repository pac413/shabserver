import Promise from 'bluebird'
import { importDefaultMedia } from 'Import/common/media/importDefaultMedia'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { uploadMediaFromUrl } from 'Utils/media'
import { DEFAULT_SHABBAT_WALLPAPER_PREFIX } from 'Utils/globals'

const validateProfileData = (profileData) => {
  if (!profileData.roles || profileData.roles.length === 0) {
    return false
  }
  if (profileData.roles.includes('TempUser')) {
    return false
  }
  return true
}

const importMedia = async (profilesData) => {
  let success = 0
  let failure = 0
  await Promise.mapSeries(profilesData, async (p, index) => {
    if (!validateProfileData(p)) {
      return
    }
    const promises = []
    // upload avatar with thumbnails to s3
    if (p.avatar) {
      Object.keys(p.avatar).forEach((key) => {
        promises.push(
          uploadMediaFromUrl(
            p.avatar[key],
            p._id,
            MediaType.PICTURE,
            MediaSubType.AVATAR,
            key === 'original' ? 'avatar' : `avatar_${key}`
          )
        )
      })
    }
    // upload profile pictures with thumbnails to s3
    if (p.pictures) {
      p.pictures.forEach((picture, index) => {
        if (picture.isAvatar) {
          return
        }
        Object.keys(picture).forEach((key) => {
          if (key === 'isAvatar') {
            return
          }
          promises.push(
            uploadMediaFromUrl(
              picture[key],
              p._id,
              MediaType.PICTURE,
              MediaSubType.PROFILE,
              key === 'original' ? `picture${index}` : `picture${index}_${key}`
            )
          )
        })
      })
    }
    // upload wallpaper
    if (
      p.wallpaper &&
      !p.wallpaper.includes(DEFAULT_SHABBAT_WALLPAPER_PREFIX)
    ) {
      promises.push(
        uploadMediaFromUrl(
          p.wallpaper,
          p._id,
          MediaType.PICTURE,
          MediaSubType.WALLPAPER,
          'wallpaper'
        )
      )
    }

    try {
      await Promise.all(promises)
      success++
      console.info(`${index + 1} profiles are processed`)
    } catch (err) {
      failure++
      console.error(
        `failed to import media resources for profile ${p._id}`,
        err
      )
    }
  })
  console.info(
    `imported media resources for profiles: ${success} success, ${failure} failure`
  )
}

export const runMediaImport = async () => {
  console.log('deleting existing media documents...')
  await models.Media.deleteMany({})

  const data = require('Import/mock/data/user-profiles.json')
  const { SiteMembers } = data
  const offset = Number(process.env.OFFSET || 0)
  const limit = Number(process.env.LIMIT || SiteMembers.length)
  const calcLimit = Number.parseInt(offset + limit)

  const profileSlice = SiteMembers.slice(offset, calcLimit)
  console.log(
    `importing media for ${profileSlice.length} profiles from ${offset} to ${calcLimit}`
  )
  await importMedia(profileSlice)
  await importDefaultMedia()
  console.log('uploaded all media resources to s3')
}
