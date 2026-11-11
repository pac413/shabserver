import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { MediaType, MediaSubType, MediaStatus, VideoOrientation } from './enums'

const mediaSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    mediaType: {
      type: String,
      enum: Object.values(MediaType),
    },

    mediaSubType: {
      type: String,
      enum: Object.values(MediaSubType),
    },

    ownerId: {
      type: String,
      ref: 'Profile',
    },

    mimetype: {
      type: String,
    },

    originalFilename: {
      type: String,
    },

    s3Key: {
      type: String,
    },

    originalUrl: {
      type: String,
    },

    status: {
      type: String,
      enum: Object.values(MediaStatus),
    },

    thumbnails: [
      {
        _id: false,
        name: { type: String },
        s3Key: { type: String },
        url: { type: String },
      },
    ],

    quality: [
      // specific to video
      {
        _id: false,
        name: { type: String },
        s3Key: { type: String },
        url: { type: String },
      },
    ],

    trailer: {
      // specific to video
      _id: false,
      s3Key: { type: String },
      url: { type: String },
    },

    meta: {
      _id: false,
      width: { type: Number },
      height: { type: Number },
      size: { type: Number },
      orientation: {
        // specific to video
        type: String,
        enum: Object.values(VideoOrientation),
      },
      duration: {
        // specific to video, audio
        type: Number,
      },
    },

    reference: {
      conversationId: { type: String },
      originalMediaId: { type: String },
      postId: { type: String },
      feedItemId: { type: String },
      commentId: { type: String },
      commentReplyId: { type: String },
    },

    importedAt: {
      type: Date,
    },

    // when set to true it will be hidden from public
    // but visible to author
    hidden: {
      type: Boolean,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

mediaSchema.statics.MediaType = MediaType
mediaSchema.statics.MediaSubType = MediaSubType
mediaSchema.statics.MediaStatus = MediaStatus
mediaSchema.statics.VideoOrientation = VideoOrientation

mediaSchema.index({ ownerId: 1, mediaType: 1, mediaSubType: 1, hidden: 1 })
mediaSchema.index({ 'reference.postId': 1 })
mediaSchema.index({ 'reference.commentId': 1 })
mediaSchema.index({ 'reference.commentReplyId': 1 })

export default mediaSchema
