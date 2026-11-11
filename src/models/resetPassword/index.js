import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const resetPasswordSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    user: {
      type: String,
      ref: 'User',
    },

    expires: {
      type: Date,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

export default resetPasswordSchema
