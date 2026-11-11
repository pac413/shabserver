import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const postViewSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    postId: {
      type: String,
      ref: 'Post',
    },
    viewedBy: {
      type: String,
      ref: 'Profile',
    },
    date: {
      type: Date,
    },
    // This is required for post migration.
    productionId: {
      type: String,
      default: null,
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

postViewSchema.index({
  postId: 1,
  date: -1,
})
postViewSchema.index({ productionId: 1 })

export default postViewSchema
