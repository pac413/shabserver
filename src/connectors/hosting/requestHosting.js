import { ForbiddenError, UserInputError } from 'apollo-server-express'
import { isActionBlocked } from 'Connectors/blocking'
import { createConversationForHosting } from 'Connectors/conversations'
import { getFlags } from 'Connectors/profile'
import { isActionsRestricted } from 'Connectors/user'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { HostingStatus, HostingType } from 'Models/hosting/enums'
import { ProfileFlagScopes } from 'Models/profile/enums'
import { checkHostingAccess } from './helpers'
import sendHostingRequestNotifications from './sendHostingRequestNotifications'

export default async function requestHosting(input, context) {
  const { host, parts, date, note, privateInviteCode } = input
  const { activeProfileId } = context

  const actionBlocked = await isActionBlocked(activeProfileId, host)
  if (actionBlocked) {
    throw new ForbiddenError(ERRORS_BY_CODE.REQUEST_HOSTING_FORBIDDEN)
  }

  const activeProfile = await models.Profile.findById(activeProfileId)
    // phone and location is used by getFlags function
    .select({ phone: 1, location: 1, restrictions: 1 })
    .lean()
  const flags = getFlags(activeProfile)
    ? getFlags(activeProfile).filter((flag) =>
        flag.scopes.includes(ProfileFlagScopes.HOSTING)
      )
    : []
  if (flags.length > 0) {
    throw new UserInputError(ERRORS_BY_CODE.INCOMPLETE_PROFILE, {
      flags: flags.map((flag) => flag.code).join(','),
    })
  }

  await checkHostingAccess(host, false, privateInviteCode)

  const hosting = await models.Hosting.create({
    host,
    guest: activeProfileId,
    type: HostingType.REQUEST,
    guestParts: parts,
    date,
    hidden: isActionsRestricted(activeProfile),
  })

  await hosting.setStatus(activeProfileId, HostingStatus.PENDING, note)

  // Do not send notification to recipient if requester is "Action Restricted"
  if (hosting.hidden) {
    return { hosting }
  }
  eventManager.emit(eventManager.events.HOSTING_REQUESTED, hosting)
  await sendHostingRequestNotifications(hosting, {
    activeProfileId,
  })
  await createConversationForHosting(
    {
      hosting,
      note,
      isSendingNewHostingMessage: true,
    },
    context
  )
  return { hosting }
}
