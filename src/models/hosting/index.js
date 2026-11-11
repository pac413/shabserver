import moment from 'moment'
import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { HostingPart, HostingStatus, HostingType } from './enums'

const hostingSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    host: {
      type: String,
      ref: 'Profile',
    },

    guest: {
      type: String,
      ref: 'Profile',
    },

    type: {
      type: String,
      enum: Object.values(HostingType),
    },

    guestParts: [
      {
        type: String,
        enum: Object.values(HostingPart),
        default: [],
      },
    ],

    hostParts: [
      {
        type: String,
        enum: Object.values(HostingPart),
        default: [],
      },
    ],

    date: {
      type: Date,
    },
    statusHistory: [
      {
        _id: false,
        profile: {
          type: String,
          ref: 'Profile',
        },
        status: {
          type: String,
          enum: Object.values(HostingStatus),
        },
        note: {
          type: String,
          default: '',
        },
        date: {
          type: Date,
          default: () => moment.utc().toDate(),
        },
      },
    ],

    status: {
      type: String,
      enum: Object.values(HostingStatus),
    },

    // when set to true it will be hidden from recipient
    // but visible to author and admin
    // used in conjunction with member restrictions feature
    hidden: {
      type: Boolean,
    },

    notifiedHostEndorsementAt: {
      type: Date,
    },

    notifiedGuestEndorsementAt: {
      type: Date,
    },

    importedAt: {
      type: Date,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

hostingSchema.statics.Types = HostingType
hostingSchema.statics.Parts = HostingPart
hostingSchema.statics.Statuses = HostingStatus
hostingSchema.virtual('sharedParts').get(function () {
  return this.hostParts.filter((p) => this.guestParts.includes(p))
})
hostingSchema.methods.setStatus = async function (profile, status, note) {
  this.statusHistory.push({ profile, status, note })
  this.status = status
  await this.save()
  return this
}

hostingSchema.index({ guest: 1, date: -1, status: 1, type: 1 })
hostingSchema.index({ host: 1, date: -1, status: 1, type: 1 })

// TODO: used for migration so we can remove this whenever we are fully migrated.
hostingSchema.index({ importedAt: 1 })

export default hostingSchema
