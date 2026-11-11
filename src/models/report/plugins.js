import { Model } from 'mongoose'

module.exports = function (schema) {
  schema.statics.findAll = Model.find
}
