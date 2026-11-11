import { DEFAULT_SHABBAT_PROFILE_S3_KEY } from 'Utils/globals'

export default {
  Wallpaper: {
    id: (parent) => parent.id || parent._id,
    originalMediaId: (parent) => {
      if (parent.reference && parent.reference.originalMediaId) {
        return parent.reference.originalMediaId
      }
      return null
    },
    original: (parent) => parent.originalUrl,
    isPlaceholder: (parent) => {
      if (parent.s3Key.includes(DEFAULT_SHABBAT_PROFILE_S3_KEY)) {
        return true
      }
      return false
    },
  },
}
