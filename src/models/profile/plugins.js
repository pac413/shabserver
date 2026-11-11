import { Model } from 'mongoose'
import { ProfileStatuses } from './enums'

module.exports = function (schema) {
  schema.statics.findAll = Model.find
  const overridableMethods = ['count', 'countDocuments', 'find', 'findOne']
  overridableMethods.forEach(function (method) {
    schema.statics[method] = function () {
      return Model[method].apply(this, arguments).where({
        accountStatus: {
          $nin: [ProfileStatuses.DELETED, ProfileStatuses.ADMIN_SUSPENDED],
        },
      })
    }
  })
}
