import { QUALITY, THUMBNAILS } from 'Utils/globals'

export default {
  Video: {
    id: (parent) => parent._id,
    thumbnails: (parent) => {
      const videoThumbnailNames = [
        THUMBNAILS.SMALL,
        THUMBNAILS.MEDIUM,
        THUMBNAILS.LARGE,
      ]
      return videoThumbnailNames.reduce((acc, cur) => {
        const thumbnail = parent.thumbnails.find(({ name }) => name === cur)
        acc[cur] = thumbnail ? thumbnail.url : null
        return acc
      }, {})
    },
    original: (parent) => {
      return parent.originalUrl
    },
    low: (parent) => {
      const lowQualityVideo = parent.quality.find(
        ({ name }) => name === QUALITY.LOW
      )
      return lowQualityVideo.url
    },
    meta: (parent) => {
      return parent.meta
    },
  },
}
