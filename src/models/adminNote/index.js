import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import {
  PreDefineds,
  UserAccountDeleteReasons,
  AdminAccountDeleteReasons,
} from './enums'

const AdminNoteSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    noteable: {
      type: String,
    },
    noteableId: {
      type: String,
      ref: 'Profile',
    },
    note: {
      type: String,
    },
    predefineds: [
      {
        _id: false,
        type: {
          type: String,
          enum: Object.values(PreDefineds),
        },
        content: {
          type: String,
          enum: [
            ...Object.values(UserAccountDeleteReasons),
            ...Object.values(AdminAccountDeleteReasons),
          ],
        },
      },
    ],
    profiles: [
      {
        type: String,
        ref: 'Profile',
      },
    ],
  },
  {
    _id: false,
    timestamps: {},
  }
)

AdminNoteSchema.statics.Predefineds = PreDefineds
AdminNoteSchema.statics.UserAccountDeleteReasons = UserAccountDeleteReasons

export default AdminNoteSchema
