import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const mutedConnection = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    profileId: {
      type: String,
      ref: 'Profile',
    },

    // Profile(profileId) hides posts from Profile(mutedProfileId)
    mutedProfileId: {
      type: String,
      ref: 'Profile',
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

mutedConnection.index({ profileId: 1 })
mutedConnection.index({ mutedProfileId: 1 })

export default mutedConnection
