import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { FollowerType } from './enums'

const followerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    profileId: {
      type: String,
      ref: 'Profile',
    },

    followerProfileId: {
      type: String,
      ref: 'Profile',
    },

    type: [
      {
        type: String,
        enum: Object.values(FollowerType),
      },
    ],
  },
  {
    _id: false,
    timestamps: {},
  }
)

followerSchema.statics.FollowerType = FollowerType

followerSchema.index({ profileId: 1 })
followerSchema.index({ followerProfileId: 1 })

export default followerSchema
