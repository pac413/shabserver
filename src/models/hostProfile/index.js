import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import {
  HostProfileStatus,
  HostProfileReserveBy,
  HostProfileType,
} from './enums'

const hostProfileSchema = new mongoose.Schema(
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
      enum: Object.values(HostProfileStatus),
      default: HostProfileStatus.AVAILABLE,
      index: true,
    },

    type: {
      type: String,
      enum: Object.values(HostProfileType),
      default: HostProfileType.DEFAULT,
    },

    activeDates: [
      {
        type: Date,
      },
    ],

    reserveBy: {
      type: String,
      enum: Object.values(HostProfileReserveBy),
      default: HostProfileReserveBy.THURSDAY,
    },

    canHostMeals: {
      type: Boolean,
      default: true,
    },

    mealAmount: {
      type: Number,
      default: 0,
    },

    canHostSleep: {
      type: Boolean,
      default: true,
    },

    sleepAmount: {
      type: Number,
      default: 2,
    },

    hostMen: {
      type: Boolean,
      default: true,
    },

    hostWomen: {
      type: Boolean,
      default: true,
    },

    hostFamiliesWithChildren: {
      type: Boolean,
      default: true,
    },

    hostAffiliatedJews: {
      type: Boolean,
      default: true,
    },

    hostUnAffiliatedJews: {
      type: Boolean,
      default: true,
    },

    showGuestList: {
      type: Boolean,
      default: true,
    },

    location: {
      type: String,
      ref: 'Location',
    },

    privateInviteEnabled: {
      type: Boolean,
      default: false,
    },

    privateInviteCode: {
      type: String,
    },

    // This will be an array of automatically generated recommendations based on matching needs
    // and location.
    // In the future the recommendations should be improved by using other properties such as
    // site activity friends, interests, occupations, etc.
    // This would also be used to promote feed items and increase visibility.
    // This is not an invitations. Members would still need to take action and initiate an
    // invitation or request (aka shabbosRequest)
    potentialGuests: [
      {
        type: String,
        ref: 'Profile',
      },
    ],

    unavailableGuests: [
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

hostProfileSchema.statics.Statuses = HostProfileStatus
hostProfileSchema.statics.ReserveBy = HostProfileReserveBy
hostProfileSchema.statics.Types = HostProfileType

hostProfileSchema.index({ profile: 1 })
hostProfileSchema.index({ type: 1 })
hostProfileSchema.index({ activeDates: 1 })

export default hostProfileSchema
