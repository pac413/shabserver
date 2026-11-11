import { ForbiddenError, UserInputError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { isActionBlocked } from 'Connectors/blocking'
import { notifyAboutEndorsement } from './notifyAboutEndorsement'

export const endorse = async (endorser, siteRole, id, body, endorsingBack) => {
  const actionBlocked = await isActionBlocked(endorser, id)
  if (actionBlocked) {
    throw new ForbiddenError(ERRORS_BY_CODE.ENDORSE_BLOCKED)
  }
  const profile = await models.Profile.findById(id)
    .select({ siteRoles: 1 })
    .lean()

  if (!profile.siteRoles.includes(siteRole)) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_ENDORSEE_SITE_ROLE, {
      siteRole,
    })
  }

  const endorsement = await models.Endorsement.create({
    endorser,
    onSiteRole: siteRole,
    profile: id,
    body,
  })

  // creating endorsement notification and email
  await notifyAboutEndorsement(endorsement, {
    activeProfileId: endorser,
    endorsingBack,
  })

  return endorsement
}
