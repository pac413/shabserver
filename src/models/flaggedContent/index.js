import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { FlaggedContentType } from './enums'

const FlaggedContentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    resourceId: {
      type: String,
    },
    type: {
      type: String,
      enum: Object.values(FlaggedContentType),
    },
    reason: {
      type: String,
    },
    reportedBy: {
      type: String,
      ref: 'Profile',
    },
    ownedBy: {
      type: String,
      ref: 'Profile',
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

FlaggedContentSchema.statics.FlaggedContentType = FlaggedContentType

FlaggedContentSchema.index({
  resourceId: 1,
  type: 1,
  reportedBy: 1,
})

export default FlaggedContentSchema
