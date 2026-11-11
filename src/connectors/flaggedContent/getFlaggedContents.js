import { ForbiddenError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { Roles } from 'Utils/globals'

export default async function ({ limit, offset }, { role }) {
  if (role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
  }

  const total = await models.FlaggedContent.countDocuments()
  if (!total) {
    return { total, contents: [] }
  }
  const contents = await models.FlaggedContent.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(offset)
    .lean()

  return { total, contents }
}
