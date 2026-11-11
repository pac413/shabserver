import mongoose from 'mongoose'
import { v4 as uuid } from 'uuid'

const occupationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },
    name: {
      type: String,
      // index: true
    },
    lang: {
      type: String,
      // index: true
    },
    occupationId: {
      type: Number,
      // index: true
    },
  },
  {
    _id: false,
    timestamps: {},
  }
)

occupationSchema.index({ name: 1 })
occupationSchema.index({ lang: 1 })

export default occupationSchema
