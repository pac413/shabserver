import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { GuestProfileStatus } from './enums'

const guestProfileSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    profile: {
      type: String,
      ref: 'Profile',
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(GuestProfileStatus),
      default: GuestProfileStatus.AVAILABLE,
      index: true,
    },

    location: {
      type: String,
      ref: 'Location',
    },

    // This will be an array of automatically generated recommendations based on matching needs
    // and location.
    // In the future the recommendations should be improved by using other properties such as
    // site activity friends, interests, occupations, etc.
    // This would also be used to promote feed items and increase visibility.
    // This is not an invitations. Members would still need to take action and initiate an
    // invitation or request (aka shabbosRequest)
    potentialHosts: [
      {
        type: String,
        ref: 'Profile',
      },
    ],

    importedAt: {
      type: Date,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

guestProfileSchema.statics.Statuses = GuestProfileStatus

guestProfileSchema.index({ profile: 1 })

export default guestProfileSchema
