import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const messageReactionSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    reaction: {
      type: String,
      required: true,
    },
    messageId: {
      type: String,
      ref: 'Message',
      required: true,
    },
    reactedBy: {
      type: String,
      ref: 'Profile',
    },
    date: {
      type: Date,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

messageReactionSchema.index({
  messageId: 1,
  date: -1,
  reaction: 1,
})

export default messageReactionSchema
