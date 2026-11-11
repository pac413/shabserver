import mongoose from 'mongoose'
import moment from 'moment'
import { v4 as uuid } from 'uuid'
import { webScrapedSchema } from '../common'
import {
  MessageStatus,
  MessageFlaggedReason,
  MessageFlaggedSeverity,
  MessageType,
} from './enums'

const messageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    conversation: {
      type: String,
      ref: 'Conversation',
    },
    text: {
      type: String,
    },
    sender: {
      type: String,
      ref: 'Profile',
    },
    isBroadcastMessage: {
      type: Boolean,
      default: false,
    },
    recipients: [
      {
        _id: false,
        recipient: {
          type: String,
          ref: 'Profile',
        },
        status: {
          type: String,
          enum: Object.values(MessageStatus),
        },
        deleted: {
          type: Boolean,
        },
        deletedDate: {
          type: Date,
        },
        read: {
          type: Boolean,
        },
        readDate: {
          type: Date,
        },
      },
    ],

    // used for content review. If a message is found to contain offensive content its status (below) will
    // be set to 'blocked' and this sub document will hold the reason
    flagged: [
      {
        flags: [
          {
            flaggedReason: {
              type: String,
              enum: Object.values(MessageFlaggedReason),
            },
            flaggedSeverity: {
              type: String,
              enum: Object.values(MessageFlaggedSeverity),
            },
            review: {
              date: {
                type: Date,
              },
              reviewer: {
                type: String,
                ref: 'Profile',
              },
              override: {
                type: Boolean,
              },
            },
          },
        ],
      },
    ],

    // when set to true it will be hidden from public
    // but visible to author and admin
    // used in conjunction with member restrictions feature
    hidden: {
      type: Boolean,
    },

    // this will be set if the sender edits or deletes the message
    // if a message is marked deleted it will not be returned in queries and subscriptions
    senderDeleted: {
      _id: false,
      deleted: {
        type: Boolean,
      },
      date: {
        type: Date,
      },
    },
    senderEdited: {
      _id: false,
      edited: {
        Boolean,
      },
      date: {
        type: Date,
      },
    },
    // Every message starts of in the pending status. The message is 'sent' by setting it's status to 'sent'
    // Only messages with a sent status will be returned in queries and subscriptions
    status: {
      type: String,
      enum: Object.values(MessageStatus),
      default: MessageStatus.PENDING,
    },

    dateSent: {
      type: Date,
      default: () => moment.utc().toDate(),
    },
    attachments: [
      {
        type: String,
        ref: 'Media',
      },
    ],
    type: {
      type: String,
      enum: Object.values(MessageType),
      default: MessageType.Text,
    },
    webScraped: {
      type: webScrapedSchema,
    },
  },
  { _id: false }
)

messageSchema.statics.Statuses = MessageStatus
messageSchema.statics.MessageType = MessageType

messageSchema.index(
  {
    deleted: -1,
    conversation: 1,
    'senderDeleted.deleted': -1,
    sender: 1,
    hidden: -1,
    dateSent: -1,
  },
  {
    name: 'messagesIndex',
  }
)

messageSchema.index({
  deleted: -1,
  sender: 1,
  'recipients.recipient': 1,
})

messageSchema.index(
  {
    deleted: -1,
    conversation: 1,
    'recipients.recipient': 1,
    'recipients.read': -11,
  },
  { name: 'messagesReadIndex' }
)

messageSchema.index({ attachments: 1 }, { name: 'messageAttachmentsIndex' })
messageSchema.index({ deleted: -1, sender: 1 }, { name: 'senderIndex' })

export default messageSchema
