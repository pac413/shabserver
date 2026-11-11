import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { MatchParty } from './enums'

const datingMatchSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    guy: {
      type: String,
      ref: 'Profile',
    },

    girl: {
      type: String,
      ref: 'Profile',
    },

    matchmaker: {
      type: String,
      ref: 'Profile',
    },

    message: {
      type: String,
    },

    party: {
      type: String,
      enum: Object.values(MatchParty),
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

datingMatchSchema.statics.MatchParty = MatchParty

export default datingMatchSchema
