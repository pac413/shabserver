import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import reportPlugin from './plugins'

const reportSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    // user who was reported
    reportedUser: {
      type: String,
      ref: 'Profile',
    },

    // user who made a report
    reporter: {
      type: String,
      ref: 'Profile',
    },

    reason: {
      type: String,
    },

    additionalDetails: {
      type: String,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

reportSchema.plugin(reportPlugin)

reportSchema.index({
  reportedUser: 1,
  reporter: 1,
})

export default reportSchema
