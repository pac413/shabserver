import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const Journal = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    /*
    “tags” are a flexible way for linking, grouping and keeping track of records.
    by using them we will be able to easily identify what was the reason of the record, what was the outcome and when it happen.
    for example: ['sign-up', 'sign-up-rejected', 'blacklisted-password']
    it will tell that there was a sign up, but it was rejected and the reason is a blacklisted password
    */
    tags: {
      type: [String],
    },
    message: {
      type: String,
    },
    /*
    "Context will" contain any arbitrary data that might be helpful to understand the context of event.
    It can be payload, ids and etc.
     */
    context: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

export default Journal
