import mongoose from 'mongoose'

export const postFlaggedSchema = new mongoose.Schema(
  {
    reason: {
      type: String,
    },
    reportedBy: {
      type: String,
      ref: 'Profile',
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)
