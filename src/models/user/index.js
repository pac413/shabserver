import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { v4 as uuid } from 'uuid'
import validator from 'validator'
import models from 'Models'

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => uuid(),
    },

    firstName: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      unique: true,
      set: (val) => val.toLowerCase(),
      validate: {
        validator(val) {
          return validator.isEmail(val)
        },
        message: (props) => `${props.value} is not a valid email!`,
      },
    },

    emailConfirmed: {
      type: Boolean,
    },

    emailToken: {
      type: String,
      default: () => uuid(),
    },

    password: {
      type: String,
    },

    role: {
      type: String,
    },

    google: {
      _id: false,
      id: {
        type: String,
      },
      token: {
        type: String,
      },
      email: {
        type: String,
      },
      name: {
        type: String,
      },
    },

    facebook: {
      _id: false,
      id: {
        type: String,
      },
      token: {
        type: String,
      },
      email: {
        type: String,
      },
      name: {
        type: String,
      },
    },

    apple: {
      _id: false,
      id: {
        type: String,
      },
      token: {
        type: String,
      },
    },

    touchId: {
      type: String,
    },

    lastLogin: {
      type: Date,
    },
    isAdmin: {
      type: Boolean,
    },
    importedAt: {
      type: Date,
    },
  },
  { _id: false }
)

userSchema.statics.generatePasswordHash = async function (password) {
  const saltRounds = 10
  return await bcrypt.hash(password, saltRounds)
}

userSchema.methods.validatePassword = async function (password) {
  return await bcrypt.compare(password, this.password || '')
}

userSchema.post('save', function (doc) {
  if (this.isModified('email')) {
    models.Profile.updateOne({ user: this._id }, { $set: { email: doc.email } })
  }
})

userSchema.index({ 'google.id': 1 })
userSchema.index({ 'facebook.id': 1 })
userSchema.index({ touchId: 1 })

export default userSchema
