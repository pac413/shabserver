import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const blockingSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    profileId: {
      type: String,
      ref: 'Profile',
    },

    // Profile(profileId) blocks other(block)
    blockedProfileId: {
      type: String,
      ref: 'Profile',
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

blockingSchema.index({ profileId: 1 })
blockingSchema.index({ blockedProfileId: 1 })

export default blockingSchema
