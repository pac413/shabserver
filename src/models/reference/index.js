import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import { SiteRoles } from 'Models/profile/enums'
import { getValidPhoneNumber, validatePhoneNumber } from 'Utils/phone'
import { ReferenceRelationship } from './enums'

const referenceSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    // owner of reference
    profile: {
      type: String,
      ref: 'Profile',
    },

    // shabbat member selected as reference
    profileShabbatMember: {
      type: String,
      ref: 'Profile',
    },

    name: {
      type: String,
    },

    relationship: [
      {
        type: String,
        enum: Object.values(ReferenceRelationship),
      },
    ],

    siteRole: {
      type: String,
      enum: Object.values(SiteRoles),
    },

    phone: {
      type: String,
      set: getValidPhoneNumber,
      validate: {
        validator: validatePhoneNumber,
        message: (props) => `${props.value} is not a valid phone!`,
      },
    },

    email: {
      type: String,
      set: (val) => val.toLowerCase(),
      validate: {
        validator(val) {
          return val ? validator.isEmail(val) : true
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    importedAt: {
      type: Date,
    },
  },
  { _id: false }
)

referenceSchema.statics.Relationships = ReferenceRelationship

referenceSchema.index({ profile: 1, createdAt: -1 })

// TODO: used for migration so we can remove this whenever we are fully migrated.
referenceSchema.index({ importedAt: 1 })

export default referenceSchema
