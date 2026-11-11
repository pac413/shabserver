import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { postFlaggedSchema, webScrapedSchema } from 'Models/common'

const postCommentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    content: {
      type: String,
    },
    webScraped: {
      type: webScrapedSchema,
    },
    commentedBy: {
      type: String,
      ref: 'Profile',
    },
    postId: {
      type: String,
      ref: 'Post',
    },
    commentId: {
      type: String,
      ref: 'PostComment',
    },
    flagged: [
      {
        type: postFlaggedSchema,
      },
    ],
    // when set to true it will be hidden from public
    // but visible to author and admin
    // used in conjunction with member restrictions feature
    hidden: {
      type: Boolean,
      default: false,
    },
    isHiddenOrFlagged: {
      type: Boolean,
      default: false,
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

postCommentSchema.index({
  postId: 1,
  commentId: 1,
  commentedBy: 1,
  isHiddenOrFlagged: 1,
  date: -1,
})
postCommentSchema.index({
  commentedBy: 1,
  isHiddenOrFlagged: 1,
})
postCommentSchema.index({ productionId: 1 })

export default postCommentSchema
