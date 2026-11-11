import { ForbiddenError } from 'apollo-server-express'
import { skip } from 'graphql-resolvers'
import { ERRORS_BY_CODE } from 'Errors'
import { Roles } from 'Utils/globals'

export const isAuthenticated = (parent, args, { activeProfileId }) =>
  activeProfileId ? skip : new ForbiddenError('Not authenticated as user.')

export const profileIdInCtx = (parent, { input: { id } }, ctx) => {
  const { activeProfileId, role } = ctx
  if (id && id !== activeProfileId) {
    if (role !== Roles.Admin) {
      throw new ForbiddenError(ERRORS_BY_CODE.PROFILE_UPDATE_FORBIDDEN, {
        profileId: id,
      })
    } else {
      ctx.profileId = id
    }
  } else {
    ctx.profileId = activeProfileId
  }
  return skip
}
