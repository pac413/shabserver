import mediaLoader from 'DataLoaders/mediaLoader'
import { MediaSubType, MediaType } from 'Models/media/enums'
import {
  DEFAULT_SHABBAT_PROFILE_S3_KEY,
  DEFAULT_WALLPAPER,
} from 'Utils/globals'

export default async function getWallpaperMedia(profile) {
  const { wallpaper } = profile
  if (wallpaper) {
    const media = await mediaLoader.load(wallpaper)
    if (media) {
      return media
    }
  }

  // Hardcoded default wallpaper media
  const s3Key = 'picture/wallpaper/shabbat_default/default_wallpaper.jpeg'
  const { AWS_CLOUDFRONT_DOMAIN_NAME } = process.env
  return {
    id: '00000000-0000-4000-A000-000000000000',
    url: DEFAULT_WALLPAPER,
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.WALLPAPER,
    ownerId: DEFAULT_SHABBAT_PROFILE_S3_KEY,
    mimetype: 'image/jpeg',
    originalFilename: 'https://old.shabbat.com/assets/app/cover-picture/2.jpg',
    s3Key,
    originalUrl: `https://${AWS_CLOUDFRONT_DOMAIN_NAME}/${s3Key}`,
    status: 'completed',
    thumbnails: [],
    quality: [],
  }
}
