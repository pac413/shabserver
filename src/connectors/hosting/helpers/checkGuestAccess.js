import { ForbiddenError } from 'apollo-server-express'
import { isActionBlocked } from 'Connectors/blocking'
import models from 'Models'
import { GuestProfileStatus } from 'Models/guestProfile/enums'
import { ERRORS_BY_CODE } from 'Errors'

export async function checkGuestAccess(hostId, guestId) {
  const actionBlocked = await isActionBlocked(hostId, guestId)
  if (actionBlocked) {
    throw new ForbiddenError(ERRORS_BY_CODE.CREATE_INVITE_FORBIDDEN)
  }

  const guestProfile = await models.GuestProfile.findOne({ profile: guestId })
  if (!guestProfile) {
    throw new ForbiddenError(ERRORS_BY_CODE.CREATE_INVITE_FORBIDDEN)
  }
  if (
    ![
      GuestProfileStatus.AVAILABLE,
      GuestProfileStatus.ACTIVELY_LOOKING,
    ].includes(guestProfile.status)
  ) {
    throw new ForbiddenError(ERRORS_BY_CODE.CREATE_INVITE_FORBIDDEN)
  }
}
