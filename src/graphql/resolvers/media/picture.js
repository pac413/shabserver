import { THUMBNAILS } from 'Utils/globals'

export default {
  Picture: {
    id: (parent) => parent._id,
    originalMediaId: (parent) => {
      if (parent.reference && parent.reference.originalMediaId) {
        return parent.reference.originalMediaId
      }
      return null
    },
    medium: (parent) => {
      const thumbnail = parent.thumbnails.find(
        ({ name }) => name === THUMBNAILS.MEDIUM
      )
      return thumbnail ? thumbnail.url : null
    },
    large: (parent) => {
      const thumbnail = parent.thumbnails.find(
        ({ name }) => name === THUMBNAILS.LARGE
      )
      return thumbnail ? thumbnail.url : null
    },
    original: (parent) => {
      return parent.originalUrl
    },
  },
}
