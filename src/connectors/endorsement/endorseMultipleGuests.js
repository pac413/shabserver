import { ForbiddenError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import { notifyAboutEndorsement } from './notifyAboutEndorsement'

export const endorseMultipleGuests = async (
  endorser,
  siteRole,
  multipleEndorsements
) => {
  const blockedProfileIds = await getActionBlockingProfileIds(endorser)
  const ids = multipleEndorsements.map((endorsement) => endorsement.profileId)
  const allowedIds = ids.filter((id) => !blockedProfileIds.includes(id))

  if (allowedIds.length === 0) {
    throw new ForbiddenError(ERRORS_BY_CODE.ENDORSE_BLOCKED)
  }

  const promises = multipleEndorsements.map((endorsement) =>
    models.Endorsement.create({
      endorser,
      onSiteRole: siteRole,
      profile: endorsement.profileId,
      body: endorsement.body,
    })
  )
  const endorsements = await Promise.all(promises)

  // creating endorsement notification and email
  const notificationPromises = endorsements.map((endorsement) => {
    return notifyAboutEndorsement(endorsement, {
      activeProfileId: endorser,
    })
  })
  await Promise.all(notificationPromises)

  return endorsements
}
