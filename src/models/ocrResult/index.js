import mongoose from 'mongoose'

const ocrResultSchema = new mongoose.Schema(
  {
    _id: {
      type: 'ObjectId',
    },
    profileId: {
      type: String,
    },
    profileHandle: {
      type: String,
    },
    mediaId: {
      type: String,
    },
    originalUrl: {
      type: String,
    },
    profileUrl: {
      type: String,
    },
    ocr: {
      type: Object,
      default: () => {},
    },
    isTextImage: {
      type: Boolean,
      default: false,
    },
    isTextAvatar: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

ocrResultSchema.index({ isTextImage: 1 })

export default ocrResultSchema
