import { ForbiddenError } from 'apollo-server-express'
import { isActionBlocked } from 'Connectors/blocking'
import { ERRORS_BY_CODE } from 'Errors'
import { HostingType } from 'Models/hosting/enums'

export default async function checkCanAcceptHosting(
  hosting,
  { activeProfileId }
) {
  const { type, host, guest } = hosting

  if (type === HostingType.INVITATION) {
    if (activeProfileId !== guest) {
      throw new ForbiddenError(
        ERRORS_BY_CODE.ACCEPT_HOSTING_INVITATION_FORBIDDEN
      )
    }

    const actionBlocked = await isActionBlocked(activeProfileId, host)
    if (actionBlocked) {
      throw new ForbiddenError(
        ERRORS_BY_CODE.ACCEPT_HOSTING_INVITATION_FORBIDDEN
      )
    }
  }
  if (type === HostingType.REQUEST) {
    if (activeProfileId !== host) {
      throw new ForbiddenError(ERRORS_BY_CODE.ACCEPT_HOSTING_REQUEST_FORBIDDEN)
    }

    const actionBlocked = await isActionBlocked(activeProfileId, guest)
    if (actionBlocked) {
      throw new ForbiddenError(ERRORS_BY_CODE.ACCEPT_HOSTING_REQUEST_FORBIDDEN)
    }
  }
  return true
}
