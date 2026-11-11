import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import {
  NotificationActionStyle,
  NotificationActionType,
  NotificationStatus,
  NotificationType,
} from './enums'

/**
 * Notification Text Schema - title, content
 */
const notificationTextSchema = new mongoose.Schema({
  _id: false,
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

/**
 * Notification Action Schema
 */
const notificationActionSchema = new mongoose.Schema({
  _id: false,
  /**
   * Name of the action
   */
  name: {
    type: String,
  },

  /**
   * Phrase of the i18n translation
   */
  label: {
    type: notificationTextSchema,
  },

  /**
   * Style of the notification action
   * i.e. Primary, Secondary, ...
   */
  style: {
    type: String,
    enum: Object.values(NotificationActionStyle),
  },

  /**
   * Type of the notification action
   * i.e. VIEW_PROFILE, ACCEPT_FRIEND_REQUEST ...
   */
  type: {
    type: String,
    enum: Object.values(NotificationActionType),
  },

  /**
   * Action url (Optional)
   */
  actionUrl: {
    type: String,
  },

  /**
   * Action specific payload (Optional)
   */
  payload: {
    type: Object,
    default: () => {},
  },
})

const notificationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    /**
     * Profile who will receive this notification
     */
    profile: {
      type: String,
      ref: 'Profile',
    },

    /**
     * Profile who triggered this notification
     */
    triggeredBy: {
      type: String,
      ref: 'Profile',
    },

    /**
     * Notification Type
     * i.e. new_message, new_friend_request
     */
    type: {
      type: String,
      enum: Object.values(NotificationType),
    },

    /**
     * Title of the notification - supports translations
     */
    title: {
      type: notificationTextSchema,
    },

    /**
     * Detailed description of the notification - supports translations
     */
    content: {
      type: notificationTextSchema,
    },

    /**
     * Status of the notification - dismissed, unviewed, viewed
     */
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
    },

    /**
     * Reference Id related to the notification
     * i.e. For "new_message", message id
     */
    referenceId: {
      type: String,
    },

    hidden: {
      type: Boolean,
      default: false,
    },

    /**
     * List of actions for this notification
     */
    actions: [notificationActionSchema],
  },
  {
    _id: false,
    timestamps: {},
  }
)

notificationSchema.statics.NotificationStatus = NotificationStatus
notificationSchema.statics.NotificationType = NotificationType
notificationSchema.statics.NotificationActionStyle = NotificationActionStyle
notificationSchema.statics.NotificationActionType = NotificationActionType

notificationSchema.index({
  profile: 1,
  status: 1,
  type: 1,
  updatedAt: -1,
})

notificationSchema.index({
  type: 1,
  referenceId: 1,
  profile: 1,
})

export const messageNotificationTypes = [
  NotificationType.NEW_MESSAGE,
  NotificationType.MESSAGE_REQUEST,
  NotificationType.MESSAGE_REQUEST_APPROVED,
  NotificationType.MESSAGE_REQUEST_REJECTED,
]

export const postNotificationTypes = [
  NotificationType.POST_LIKED,
  NotificationType.POST_COMMENTED,
  NotificationType.POST_COMMENT_LIKED,
  NotificationType.POST_COMMENT_COMMENTED,
  NotificationType.POST_PICTURE_PROCESSED,
  NotificationType.POST_VIDEO_PROCESSED,
]

export default notificationSchema
