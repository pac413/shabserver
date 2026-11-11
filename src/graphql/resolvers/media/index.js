import {
  deleteMedia,
  updateMedia,
  getMediaUploadUrl,
  confirmAndProcessUploadedMedia,
} from 'Connectors/media'
import models from 'Models'

export default {
  Query: {
    async getMedia(_, { input: { id } }) {
      const media = await models.Media.findById(id).lean()
      if (!media) {
        return null
      }
      if (!media.meta) {
        media.meta = {
          width: null,
          height: null,
          size: null,
          orientation: null,
          duration: null,
        }
      }
      return { media }
    },
  },

  Mutation: {
    async deleteMedia(_, { input }) {
      try {
        await deleteMedia(input)
        return {
          deleted: true,
        }
      } catch (error) {
        return {
          deleted: false,
          errors: [error],
        }
      }
    },

    async updateMedia(_, { input }) {
      return updateMedia(input)
    },

    async getMediaUploadUrl(_, { input }, context) {
      try {
        const result = await getMediaUploadUrl(input, context)
        return result
      } catch (error) {
        console.error('Failed to generate the url to upload', error)
        throw new Error('Cannot generate the url to upload')
      }
    },

    async confirmAndProcessUploadedMedia(_, { input }, context) {
      try {
        const media = confirmAndProcessUploadedMedia(input, context)
        return media
      } catch (err) {
        console.error('Error while sending message to sqs:', err, err.stack)
        throw new Error('Cannot process uploaded media')
      }
    },
  },

  Media: {
    id: (parent) => parent.id || parent._id,
    originalMediaId: async (parent) => {
      return parent.reference && parent.reference.originalMediaId
    },
  },
}
