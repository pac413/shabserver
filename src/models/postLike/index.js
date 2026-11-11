import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const postLikeSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    postId: {
      type: String,
      ref: 'Post',
    },
    commentId: {
      type: String,
      ref: 'Post',
    },
    likedBy: {
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

postLikeSchema.index({
  postId: 1,
  commentId: 1,
  date: -1,
})
postLikeSchema.index({
  likedBy: 1,
})
postLikeSchema.index({ productionId: 1 })

export default postLikeSchema
