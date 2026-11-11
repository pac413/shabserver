import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { RequestType, RequestStatus } from './enums'

const requestSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    // user who makes this request
    requestor: {
      type: String,
      ref: 'Profile',
    },

    // user who receives this request
    recipient: {
      type: String,
      ref: 'Profile',
    },

    // type of the request
    type: {
      type: String,
      enum: Object.values(RequestType),
    },

    // status of the request
    status: {
      type: String,
      enum: Object.values(RequestStatus),
      default: RequestStatus.Pending,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

requestSchema.statics.RequestType = RequestType
requestSchema.statics.RequestStatus = RequestStatus

requestSchema.index({
  requestor: 1,
  recipient: 1,
  type: 1,
  status: 1,
})

export default requestSchema
