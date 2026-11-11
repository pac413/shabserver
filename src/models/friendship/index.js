import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import moment from 'moment'
import { FriendshipStatus, FriendshipType } from './enums'

const statusDef = {
  type: String,
  enum: Object.values(FriendshipStatus),
}

const friendshipSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    // normally this array will contain only 2 items [friendId1, friendId2], which describes their friendship
    members: [
      {
        type: String,
        ref: 'Profile',
      },
    ],
    requester: {
      type: String,
      ref: 'Profile',
    },
    currentStatus: statusDef,
    statusHistory: [
      {
        status: statusDef,
        date: {
          type: Date,
          default: () => moment.utc().toDate(),
        },
      },
    ],
    importedAt: {
      type: Date,
    },

    // when set to true it will be hidden from recipient
    // but visible to author and admin
    // used in conjunction with member restrictions feature
    hidden: {
      type: Boolean,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

friendshipSchema.statics.Statuses = FriendshipStatus
friendshipSchema.statics.Type = FriendshipType

friendshipSchema.index({
  currentStatus: 1,
  requester: 1,
  members: 1,
  hidden: 1,
})

export default friendshipSchema
