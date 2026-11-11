import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { SponsoredPostStatus, SponsoredPostType } from './enums'

const postCommentReplySchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    commentedBy: {
      type: String,
      ref: 'Profile',
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: {},
  }
)

const postCommentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
    },
    commentedBy: {
      type: String,
      ref: 'Profile',
    },
    replies: [
      {
        type: postCommentReplySchema,
      },
    ],
    date: {
      type: Date,
    },
  },
  {
    timestamps: {},
  }
)

const postLikeSchema = new mongoose.Schema(
  {
    likedBy: {
      type: String,
      ref: 'Profile',
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: {},
  }
)

const postViewSchema = new mongoose.Schema(
  {
    viewedBy: {
      type: String,
      ref: 'Profile',
    },
    date: {
      type: Date,
    },
  },
  {
    timestamps: {},
  }
)

const sponsoredPostSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    content: {
      type: String,
    },
    comments: [
      {
        type: postCommentSchema,
      },
    ],
    likes: [
      {
        type: postLikeSchema,
      },
    ],
    views: [
      {
        type: postViewSchema,
      },
    ],
    postedBy: {
      type: String,
      ref: 'Profile',
    },
    contentUpdatedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: Object.values(SponsoredPostStatus),
      default: SponsoredPostStatus.PENDING,
    },
    type: {
      type: String,
      enum: Object.values(SponsoredPostType),
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

sponsoredPostSchema.statics.SponsoredPostStatus = SponsoredPostStatus
sponsoredPostSchema.statics.SponsoredPostType = SponsoredPostType

sponsoredPostSchema.index({ type: 1 })

export default sponsoredPostSchema
