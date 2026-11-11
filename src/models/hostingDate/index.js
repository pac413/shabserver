import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'
import { HostingDateTypes } from './enums'

const hostingDateSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: () => uuid(),
  },

  date: {
    type: Date,
  },

  hebrewDate: {
    _id: false,
    type: String,
  },

  englishHebrewDate: {
    type: String,
  },

  israel: {
    _id: false,

    type: {
      type: String,
      enum: Object.values(HostingDateTypes),
    },

    name: {
      type: String,
      default: '',
    },

    hebrewName: {
      type: String,
      default: '',
    },

    parsha: {
      type: String,
      default: '',
    },

    hebrewParsha: {
      type: String,
      default: '',
    },

    isSederNight: {
      type: Boolean,
    },
  },

  diaspora: {
    _id: false,

    type: {
      type: String,
      enum: Object.values(HostingDateTypes),
    },

    name: {
      type: String,
      default: '',
    },

    hebrewName: {
      type: String,
      default: '',
    },

    parsha: {
      type: String,
      default: '',
    },

    hebrewParsha: {
      type: String,
      default: '',
    },

    isSederNight: {
      type: Boolean,
    },
  },
})

hostingDateSchema.statics.Types = HostingDateTypes

hostingDateSchema.index({ date: 1 })
hostingDateSchema.index({ 'israel.type': 1 })

export default hostingDateSchema
