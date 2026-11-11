import mongoose from 'mongoose'

const mobileAppVersionSchema = new mongoose.Schema(
  {
    releaseNumber: {
      type: String,
    },

    releaseDate: {
      type: Date,
    },

    platform: {
      // 'ios' or 'android'
      type: String,
    },

    upgradeFlag: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

mobileAppVersionSchema.index({ viewed: 1 })

export default mobileAppVersionSchema
