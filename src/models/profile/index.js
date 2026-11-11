import moment from 'moment'
import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import { capitalizeFirstLetter, capitalizeEnglishWords } from 'Utils'
import {
  Genders,
  ReligiousAffiliations,
  SiteRoles,
  SupportedLocales,
  WhoCanFriendValues,
  ProfileFlags,
  ProfileFlagScopes,
  Title,
  ProfileStatuses,
} from './enums'
import accountStatusPlugin from './plugins'
import { preferenceFields } from './preference'

const restrictionsSchema = new mongoose.Schema(
  {
    // when set to true, user will be able to send messages
    // but it will not be delivered to recipient
    messaging: {
      type: Boolean,
    },
    // when set to true, user will be able to perform actions
    // but recipient will not be noticed
    actions: {
      type: Boolean,
    },
    // when set to true, user will be able to create posts
    // but no one will be able to see them, except author and admin
    feed: {
      type: Boolean,
    },
    // when set to true, user will not be appeared in the search results
    search: {
      type: Boolean,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

const riskAssessmentSchema = new mongoose.Schema(
  {
    _id: false,
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    ipRiskScore: {
      type: Number,
    },
    minFraudRiskScore: {
      type: Number,
    },
    location: {
      city: {
        type: String,
      },
      cityConfidence: {
        type: Number,
      },
      country: {
        type: String,
      },
      countryConfidence: {
        type: Number,
      },
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

export const locationSchema = new mongoose.Schema({
  _id: false,
  address: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    trim: true,
    default: '',
    set: capitalizeEnglishWords,
  },
  state: {
    type: String,
    trim: true,
    default: '',
    set: capitalizeEnglishWords,
  },
  zipcode: {
    type: String,
    default: '',
  },
  country: {
    type: String,
    trim: true,
    default: '',
    set: capitalizeEnglishWords,
  },
  geoLocation: {
    _id: false,
    type: {
      type: String,
      enum: ['Point'],
      // required: true,
    },
    coordinates: {
      type: [Number],
      // required: true,
    },
  },
  timeZone: {
    type: Number,
  },
  timeZoneString: {
    type: String,
  },
  countryCode: {
    type: String,
  },
})

const profileSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    user: {
      type: String,
      ref: 'User',
    },

    email: {
      type: String,
      trim: true,
      required: [true, 'email is required'],
      set: (val) => val.toLowerCase(),
      validate: {
        validator(val) {
          return validator.isEmail(val)
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    firstName: {
      type: String,
      trim: true,
      default: '',
      set: capitalizeFirstLetter,
    },

    lastName: {
      type: String,
      trim: true,
      default: '',
      set: capitalizeFirstLetter,
    },

    title: {
      type: String,
      default: null,
      enum: Object.values(Title).concat([null]),
    },

    displayName: {
      type: String,
    },

    handle: {
      type: String,
    },

    avatar: {
      type: String,
      ref: 'Media',
    },

    wallpaper: {
      type: String,
      ref: 'Media',
    },

    phone: {
      type: String,
      // set: getValidPhoneNumber,
      // validate: {
      //   validator: validatePhoneNumber,
      //   message: (props) => `${props.value} is not a valid phone!`,
      // },
    },

    birthday: {
      type: Date,
    },

    gender: {
      type: String,
      enum: Object.values(Genders),
    },

    // occupation name in original language
    occupation: {
      type: String,
    },

    // language independent occupation id
    occupationId: {
      type: String,
      // index: true,
    },

    // occupation not in our curated list
    uncuratedOccupation: {
      type: String,
    },

    religiousAffiliation: {
      type: String,
      enum: Object.values(ReligiousAffiliations),
      default: ReligiousAffiliations.ORTHODOX,
    },

    about: {
      type: String,
    },

    isMarried: {
      type: Boolean,
    },

    spouse: {
      type: String,
    },

    children: {
      type: Number,
    },

    datingProfilePrivacy: {
      type: String,
    },

    datingProfilePrivate: {
      type: Boolean,
    },

    location: {
      type: locationSchema,
    },

    roles: [
      {
        type: String,
      },
    ],

    siteRoles: [
      {
        type: String,
        enum: Object.values(SiteRoles),
      },
    ],

    dateActive: {
      type: Date,
      default: () => moment.utc().toDate(),
    },

    createdAt: {
      type: Date,
    },

    organization: {
      type: String,
    },

    activelyLooking: {
      _id: false,
      guest: {
        type: Boolean,
        default: false,
      },
      guestExpire: {
        type: Date,
      },
      host: {
        type: Boolean,
        default: false,
      },
      hostExpire: {
        type: Date,
      },
    },

    legacyId: {
      type: String,
    },
    importedAt: {
      type: Date,
    },

    // preferences
    searchPreference: {
      _id: false,
      ...preferenceFields,
    },
    datingPreference: {
      _id: false,
      ...preferenceFields,
    },

    // who can send me friend requests?
    whoCanFriend: {
      type: String,
      enum: Object.values(WhoCanFriendValues),
    },

    flags: [
      {
        _id: false,
        code: {
          type: String,
          enums: Object.values(ProfileFlags),
        },
        scopes: [
          {
            type: String,
            enums: Object.values(ProfileFlagScopes),
          },
        ],
      },
    ],

    accountStatus: {
      type: String,
      enums: Object.values(ProfileStatuses),
    },

    availableOnly: {
      _id: false,
      guest: {
        type: Boolean,
        default: false,
      },
      host: {
        type: Boolean,
        default: false,
      },
    },

    riskAssessment: {
      type: riskAssessmentSchema,
    },

    restrictions: {
      type: restrictionsSchema,
    },

    onesignalId: {
      type: String,
    },

    isZealot: {
      type: Boolean,
    },

    isGreenlight: {
      type: Boolean,
    },

    primaryLocale: {
      type: String,
      enum: Object.values(SupportedLocales),
      default: 'en',
    },

    olamiContactMe: {
      type: Boolean,
      default: false,
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

profileSchema.plugin(accountStatusPlugin)

/**
 * Returns the profile with `restrictions` only by profile id
 */
profileSchema.statics.getRestrictions = async function (id) {
  const profile = await this.findById(id).select({ restrictions: 1 }).lean()
  return profile
}

profileSchema.statics.ProfileStatuses = ProfileStatuses
profileSchema.statics.Flags = ProfileFlags
profileSchema.statics.FlagScopes = ProfileFlagScopes
profileSchema.statics.SiteRoles = SiteRoles
profileSchema.statics.Genders = Genders
profileSchema.statics.ReligiousAffiliations = ReligiousAffiliations
profileSchema.statics.SupportedLocales = SupportedLocales
profileSchema.statics.WhoCanFriendValues = WhoCanFriendValues
profileSchema.statics.Title = Title

profileSchema.index({ user: 1 }, { unique: true })
profileSchema.index({ handle: 1 }, { unique: true })
profileSchema.index({ 'location.geoLocation': '2dsphere' })

profileSchema.index({
  siteRoles: 1,
  accountStatus: 1,
})

profileSchema.index({ createdAt: 1 })

profileSchema.index({ birthday: 1 })
profileSchema.index({ religionFilterType: 1 })
profileSchema.index({ dateActive: -1 })

profileSchema.index({ 'restrictions.messaging': 1 })
profileSchema.index({ 'restrictions.actions': 1 })
profileSchema.index({ 'restrictions.feed': 1 })
profileSchema.index({ 'restrictions.search': 1 })

profileSchema.index({ 'activelyLooking.guestExpire': 1 })

profileSchema.methods.isAdmin = function () {
  return this.roles && this.roles.includes('Admin')
}

export default profileSchema
