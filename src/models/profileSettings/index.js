import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import {
  MessagingPrivacyTiers,
  FeedContentSetting,
  PostPrivacySetting,
} from './enums'

const schema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    profile: {
      type: String,
      ref: 'Profile',
    },
    messagingPrivacy: {
      type: String,
      enum: Object.values(MessagingPrivacyTiers),
    },
    anonymousBrowsing: {
      type: Boolean,
    },
    friendRequestNeeded: {
      type: Boolean,
    },
    hideAllMedia: {
      type: Boolean,
    },
    messagesByEmail: {
      type: Boolean,
      default: true,
    },
    messagesByPush: {
      type: Boolean,
    },
    invitesByEmail: {
      type: Boolean,
    },
    invitesByPush: {
      type: Boolean,
    },
    profileViewsByEmail: {
      type: Boolean,
    },
    profileViewsByPush: {
      type: Boolean,
    },
    newFriendsByEmail: {
      type: Boolean,
    },
    newFriendsByPush: {
      type: Boolean,
    },
    likesByEmail: {
      type: Boolean,
    },
    likesByPush: {
      type: Boolean,
    },
    commentsByEmail: {
      type: Boolean,
    },
    commentsByPush: {
      type: Boolean,
    },
    friendRequestByEmail: {
      type: Boolean,
    },
    friendRequestByPush: {
      type: Boolean,
    },
    weeklyActivitySummaryEmail: {
      type: Boolean,
    },
    postPrivacy: {
      type: String,
      enum: Object.values(PostPrivacySetting),
    },
    feedContent: {
      type: String,
      enum: Object.values(FeedContentSetting),
    },
    paginatedSearchResult: {
      type: Boolean,
    },
    // TODO: remove this after migration to `primaryLocale`
    languageCode: {
      type: String,
      default: 'en',
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

schema.statics.MessagingPrivacyTiers = MessagingPrivacyTiers
schema.statics.FeedContentSetting = FeedContentSetting
schema.statics.PostPrivacySetting = PostPrivacySetting

schema.index({ profile: 1 }, { unique: true })

export default schema
