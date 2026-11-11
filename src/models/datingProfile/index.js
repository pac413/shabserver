import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import {
  DatingProfileBodyType,
  EmploymentStatus,
  EthnicBackground,
  Frequency,
  Hashkafa,
  Importance,
  JewishEducation,
  KeepKosher,
  Language,
  MaritalStatus,
  PersonalityTrait,
  SecularEducation,
} from './enums'

const datingProfileSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    profile: {
      type: String,
      ref: 'Profile',
    },

    aboutMe: {
      type: String,
    },

    amCohen: {
      type: Boolean,
    },

    amConvert: {
      type: Boolean,
    },

    amSmoker: {
      type: Boolean,
    },

    bodyType: {
      type: String,
      enum: [null].concat(Object.values(DatingProfileBodyType)),
    },

    childrenAgeFrom: {
      type: Number,
    },

    childrenAgeTo: {
      type: Number,
    },

    childrenAtHome: {
      type: Boolean,
    },

    coveringHair: {
      type: Boolean,
    },

    datingEmploymentStatus: {
      type: String,
      enum: [null].concat(Object.values(EmploymentStatus)),
    },

    datingJewishEducation: {
      type: String,
      enum: [null].concat(Object.values(JewishEducation)),
    },

    datingKeepKosher: {
      type: String,
      enum: [null].concat(Object.values(KeepKosher)),
    },

    datingSecularEducation: {
      type: String,
      enum: [null].concat(Object.values(SecularEducation)),
    },

    ethnicBackground: {
      type: String,
      enum: [null].concat(Object.values(EthnicBackground)),
    },

    hashkafa: {
      type: String,
      enum: [null].concat(Object.values(Hashkafa)),
    },

    haveShadchan: {
      type: Boolean,
    },

    height: {
      type: Number,
    },

    isPrivate: {
      type: Boolean,
      default: false,
    },

    livingIsrael: {
      type: String,
      enum: [null].concat(Object.values(Importance)),
    },

    locationUpbringing: {
      type: String,
    },

    lookingFor: {
      type: String,
    },

    maritalStatus: {
      type: String,
      enum: [null].concat(Object.values(MaritalStatus)),
    },

    prayer: {
      type: String,
      enum: [null].concat(Object.values(Frequency)),
    },

    primaryLanguage: {
      type: String,
      enum: [null].concat(Object.values(Language)),
      default: Language.en,
    },

    primaryPersonalityTrait: {
      type: String,
      enum: [null].concat(Object.values(PersonalityTrait)),
    },

    secondaryLanguage: {
      type: String,
      enum: [null].concat(Object.values(Language)),
    },

    secondaryPersonalityTrait: {
      type: String,
      enum: [null].concat(Object.values(PersonalityTrait)),
    },

    shadchanEmail: {
      type: String,
    },

    shadchanInfo: {
      type: String,
    },

    shadchanName: {
      type: String,
    },

    torahLearning: {
      type: String,
      enum: [null].concat(Object.values(Frequency)),
    },

    torahObservantSince: {
      type: Date,
    },

    wearSkirts: {
      type: Boolean,
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

datingProfileSchema.statics.BodyType = DatingProfileBodyType
datingProfileSchema.statics.EmploymentStatus = EmploymentStatus
datingProfileSchema.statics.EthnicBackground = EthnicBackground
datingProfileSchema.statics.Frequency = Frequency
datingProfileSchema.statics.Hashkafa = Hashkafa
datingProfileSchema.statics.Importance = Importance
datingProfileSchema.statics.JewishEducation = JewishEducation
datingProfileSchema.statics.KeepKosher = KeepKosher
datingProfileSchema.statics.Language = Language
datingProfileSchema.statics.MaritalStatus = MaritalStatus
datingProfileSchema.statics.PersonalityTrait = PersonalityTrait
datingProfileSchema.statics.SecularEducation = SecularEducation

datingProfileSchema.index({ profile: 1 }, { unique: true })
export default datingProfileSchema
