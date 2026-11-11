import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const profileViewSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    viewer: {
      type: String,
      ref: 'Profile',
    },

    browser: {
      type: String,
    },

    viewed: {
      type: String,
      ref: 'Profile',
    },

    dateViewed: {
      type: Date,
    },

    anonymous: {
      type: Boolean,
    },

    deleted: {
      type: Boolean,
    },

    importedAt: {
      type: Date,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

profileViewSchema.index({ viewed: 1 })
profileViewSchema.index({ viewer: 1 })

// TODO: used for migration so we can remove this whenever we are fully migrated.
profileViewSchema.index({ importedAt: 1 })

export default profileViewSchema
