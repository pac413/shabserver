import moment from 'moment'
import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { ConversationParticipantStatus } from './enums'

const conversationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    // List of participants. Most conversations are 1-1 so this array will usually have only 2 items
    participants: [
      {
        _id: false,
        participant: {
          type: String,
          ref: 'Profile',
        },
        // defaults:
        // the initiating participant: approved
        // the other participants: pending
        // unless they're friends or the participant is greenlit
        status: {
          type: String,
          enum: Object.values(ConversationParticipantStatus),
          default: ConversationParticipantStatus.PENDING,
        },
        unreadMessages: [
          {
            _id: false,
            type: String,
            ref: 'Message',
          },
        ],
      },
    ],
    initiator: {
      type: String,
      ref: 'Profile',
    },
    title: {
      type: String,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    hidden: {
      type: Boolean,
    },
    lastActive: {
      type: Date,
      default: () => moment.utc().toDate(),
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

conversationSchema.statics.ParticipantStatus = ConversationParticipantStatus

conversationSchema.index({ 'participants.participant': 1 })
conversationSchema.index({ 'participants.status': 1 })

conversationSchema.index(
  {
    hidden: 1,
    'participants.participant': 1,
    'participants.status': 1,
    lastActive: -1,
    updatedAt: -1,
    createdAt: -1,
  },
  { name: 'pendingConverationsIndex' }
)
export default conversationSchema
