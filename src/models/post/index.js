import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { PostPrivacySetting } from 'Models/profileSettings/enums'
import { postFlaggedSchema, webScrapedSchema } from 'Models/common'
import { PostStatus, PostType } from './enums'

/**
 * Post/Comment/Reply Text Schema
 *
 * If 'name' (i18n key) is defined, 'content' will be ignored.
 * Else, 'content' will be returned.
 */
const postTextSchema = new mongoose.Schema({
  _id: false,

  content: {
    type: String,
  },

  /**
   * Phrase of the i18n translation
   */
  name: {
    type: String,
  },

  /**
   * Variables to replace for i18n translation
   */
  variables: {
    type: Object,
    default: () => {},
  },
})

const postShareSchema = mongoose.Schema(
  {
    sharedTo: {
      type: String,
      ref: 'Profile',
    },
    sharedPostId: {
      type: String,
    },
    sharedFeedItemId: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: false,
  }
)

const postSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    content: {
      type: postTextSchema,
      default: () => '',
    },
    webScraped: {
      type: webScrapedSchema,
      default: null,
    },
    /**
     * This will be used temporarily during the migrations
     */
    migratedWebScrapedUrl: {
      type: String,
      default: null,
    },
    migratedViewsCount: {
      type: Number,
      default: 0,
    },
    postedBy: {
      type: String,
      ref: 'Profile',
    },
    contentUpdatedAt: {
      type: Date,
    },
    flagged: [
      {
        type: postFlaggedSchema,
      },
    ],
    share: {
      type: [postShareSchema],
      default: [],
    },
    // when set to true it will be hidden from public
    // but visible to author and admin
    // used in conjunction with member restrictions feature
    hidden: {
      type: Boolean,
      default: false,
    },
    // when set to true it will be hidden from the genera feed, but shown in profile
    excludedFromFeedByAdmin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: Object.values(PostStatus),
      default: PostStatus.PENDING,
    },
    hasMedia: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    type: {
      type: String,
      enum: Object.values(PostType),
      default: PostType.DEFAULT,
    },
    privacySetting: {
      type: String,
      enum: Object.values(PostPrivacySetting),
    },
    // This is required for post migration.
    productionId: {
      type: String,
      default: null,
    },
    importedAt: {
      type: Date,
    },
    eligibleForGeneralFeed: {
      type: Boolean,
      default: false,
    },
    isHiddenOrFlagged: {
      type: Boolean,
      default: false,
    },
    lastActivityAt: {
      type: Date,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

postSchema.statics.PostStatus = PostStatus
postSchema.statics.PostType = PostType

/**
 * Returns the post to check with access only
 */
postSchema.statics.getForAccessCheck = async function (id) {
  const post = await this.findById(id)
    .select({
      hidden: 1,
      postedBy: 1,
      privacySetting: 1,
    })
    .lean()
  return post
}

postSchema.index({ postedBy: 1, type: 1 })
postSchema.index({ 'flagged.reportedBy': 1 })
postSchema.index(
  {
    eligibleForGeneralFeed: 1,
    excludedFromFeedByAdmin: -1,
    postedBy: 1,
    isHiddenOrFlagged: -1,
    privacySetting: 1,
    type: 1,
    deleted: -1,
    createdAt: -1,
  },
  {
    name: 'publicConnectionsGeneralFeedIndex',
  }
)
postSchema.index(
  {
    eligibleForGeneralFeed: 1,
    excludedFromFeedByAdmin: -1,
    postedBy: 1,
    isHiddenOrFlagged: -1,
    privacySetting: 1,
    type: 1,
    deleted: -1,
    lastActivityAt: -1,
  },
  {
    name: 'trendingGeneralFeedIndex',
  }
)
postSchema.index(
  {
    postedBy: 1,
    deleted: -1,
    isHiddenOrFlagged: -1,
    createdAt: -1,
  },
  {
    name: 'profileFeedIndex',
  }
)

export default postSchema
