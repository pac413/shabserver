import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { EndorsableSiteRoles } from './enums'

const endorsementSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    endorser: {
      type: String,
      ref: 'Profile',
    },

    profile: {
      type: String,
      ref: 'Profile',
    },

    onSiteRole: {
      type: String,
      enum: Object.values(EndorsableSiteRoles),
    },

    body: {
      type: String,
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

endorsementSchema.statics.EndorsableSiteRoles = EndorsableSiteRoles
endorsementSchema.index({
  profile: 1,
  onSiteRole: 1,
  createdAt: -1,
})

// TODO: used for migration so we can remove this whenever we are fully migrated.
endorsementSchema.index({
  endorser: 1,
  profile: 1,
  onSiteRole: 1,
})

// TODO: used for migration so we can remove this whenever we are fully migrated.
endorsementSchema.index({
  profile: 1,
  importedAt: 1,
})

export default endorsementSchema
