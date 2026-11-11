import EventEmitter from 'eventemitter3'
import {
  publishMessage,
  publishConversation,
  publishUserIsTyping,
  publishNotification,
  publishPostCreated,
  publishPostUpdated,
  publishPostDeleted,
  publishProfileUpdated,
  publishMedia,
} from 'Events/subscriptions'
import {
  updateConversationLastActive,
  updateConversationLastAndIncreaseUnread,
  decreaseConversationUnread,
  updateConversationOnMessageDelete,
} from 'Events/conversations'
import {
  checkIfActivelyLooking,
  notifyHosts,
  emailNewHosting,
  sendAcceptedDeclinedHostingEmail,
} from 'Events/hosting'
import { clearCacheOnLogout } from 'Services/cache/clearCacheOnLogout'

export const events = {
  CONVERSATION_CREATED: 'CONVERSATION_CREATED',
  CONVERSATION_UPDATED: 'CONVERSATION_UPDATED',
  USER_IS_TYPING: 'USER_IS_TYPING',
  HOSTING_ACCEPTED: 'HOSTING_ACCEPTED',
  HOSTING_DECLINED: 'HOSTING_DECLINED',
  HOSTING_EXTENDED: 'HOSTING_EXTENDED',
  HOSTING_REQUESTED: 'HOSTING_REQUESTED',
  MESSAGE_SENT: 'MESSAGE_SENT',
  MESSAGE_UPDATED: 'MESSAGE_UPDATED',
  MESSAGE_READ: 'MESSAGE_READ',
  MESSAGES_READ: 'MESSAGES_READ',
  MESSAGE_DELETED: 'MESSAGE_DELETED',
  NEW_NOTIFICATION: 'NEW_NOTIFICATION',
  NOTIFICATION_DELETED: 'NOTIFICATION_DELETED',
  NOTIFICATION_UPDATED: 'NOTIFICATION_UPDATED',
  POST_CREATED: 'FEED_ITEM_CREATED',
  POST_UPDATED: 'FEED_ITEM_UPDATED',
  POST_DELETED: 'FEED_ITEM_DELETED',
  FEED_COMMENT_CREATED: 'FEED_COMMENT_CREATED',
  FEED_COMMENT_UPDATED: 'FEED_COMMENT_UPDATED',
  FEED_COMMENT_DELETED: 'FEED_COMMENT_DELETED',
  FEED_COMMENT_REPLY_CREATED: 'FEED_COMMENT_REPLY_CREATED',
  FEED_COMMENT_REPLY_UPDATED: 'FEED_COMMENT_REPLY_UPDATED',
  FEED_COMMENT_REPLY_DELETED: 'FEED_COMMENT_REPLY_DELETED',
  FEED_LIKE_CREATED: 'FEED_LIKE_CREATED',
  FEED_LIKE_UPDATED: 'FEED_LIKE_UPDATED',
  FEED_LIKE_DELETED: 'FEED_LIKE_DELETED',
  PROFILE_UPDATED: 'PROFILE_UPDATED',
  MEDIA_UPLOADED: 'MEDIA_UPLOADED',
  MEDIA_PROCESSED: 'MEDIA_PROCESSED',
  MEDIA_DELETED: 'MEDIA_DELETED',
  USER_LOGIN: 'USER_LOGIN',
  USER_LOGOUT: 'USER_LOGOUT',
}

export class EventManager extends EventEmitter {
  constructor() {
    super()
    this.events = events
  }
}

export const eventManager = new EventManager()

eventManager.on(events.USER_LOGOUT, clearCacheOnLogout)
eventManager.on(events.MESSAGE_SENT, updateConversationLastActive)
eventManager.on(events.MESSAGE_SENT, publishMessage)
eventManager.on(events.MESSAGE_SENT, updateConversationLastAndIncreaseUnread)
eventManager.on(events.MESSAGE_UPDATED, publishMessage)
eventManager.on(events.MESSAGE_DELETED, updateConversationOnMessageDelete)
eventManager.on(events.CONVERSATION_CREATED, publishConversation)
eventManager.on(events.CONVERSATION_UPDATED, publishConversation)
eventManager.on(events.USER_IS_TYPING, publishUserIsTyping)

eventManager.on(events.HOSTING_ACCEPTED, notifyHosts)
eventManager.on(events.HOSTING_ACCEPTED, sendAcceptedDeclinedHostingEmail)
eventManager.on(events.HOSTING_DECLINED, sendAcceptedDeclinedHostingEmail)
eventManager.on(events.HOSTING_REQUESTED, checkIfActivelyLooking)
eventManager.on(events.HOSTING_EXTENDED, emailNewHosting)
eventManager.on(events.HOSTING_REQUESTED, emailNewHosting)

eventManager.on(events.MESSAGE_READ, publishMessage)
eventManager.on(events.MESSAGES_READ, decreaseConversationUnread)
eventManager.on(events.NEW_NOTIFICATION, publishNotification)
eventManager.on(events.NOTIFICATION_UPDATED, publishNotification)

eventManager.on(events.POST_CREATED, publishPostCreated)
eventManager.on(events.POST_UPDATED, publishPostUpdated)
eventManager.on(events.POST_DELETED, publishPostDeleted)

eventManager.on(events.PROFILE_UPDATED, publishProfileUpdated)

eventManager.on(events.MEDIA_UPLOADED, publishMedia)
eventManager.on(events.MEDIA_PROCESSED, publishMedia)
eventManager.on(events.MEDIA_DELETED, publishMedia)
