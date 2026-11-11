import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const refreshTokenSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    user: {
      type: String,
      ref: 'User',
    },

    userAgent: {
      type: String,
    },

    ipAddress: {
      type: String,
    },

    expires: {
      type: Date,
    },

    token: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

refreshTokenSchema.index({ user: 1, userAgent: 1, ipAddress: 1 })
refreshTokenSchema.index({ token: 1 })
refreshTokenSchema.index({ expires: 1 })

export default refreshTokenSchema
