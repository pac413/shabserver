import { ForbiddenError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { Roles } from 'Utils/globals'

export default async function ({ profileId }, { role }) {
  if (role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
  }

  const contents = await models.FlaggedContent.find({ ownedBy: profileId })
    .sort({ createdAt: -1 })
    .lean()

  return { total: contents.length, contents }
}
