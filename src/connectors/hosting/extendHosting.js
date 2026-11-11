import { createConversationForHosting } from 'Connectors/conversations'
import { sendInviteNotifications } from 'Connectors/hosting'
import { isActionsRestricted } from 'Connectors/user'
import { eventManager } from 'Events'
import models from 'Models'
import { HostingStatus, HostingType } from 'Models/hosting/enums'
import { checkGuestAccess, checkHostingAccess } from './helpers'

export default async function extendHosting(input, context) {
  const { guest, parts, date, note } = input
  const { activeProfileId } = context

  // STEP 1.1: Check if activeProfile is allowed for hosting
  await checkHostingAccess(activeProfileId, true)

  // STEP 1.2: Check if guest is allowed to be invited by the activeProfile
  await checkGuestAccess(activeProfileId, guest)

  // STEP 2: Create a hosting record with the status as PENDING
  const activeProfile = await models.Profile.findById(activeProfileId)
    .select({ restrictions: 1 })
    .lean()
  const hosting = await models.Hosting.create({
    host: activeProfileId,
    guest,
    type: HostingType.INVITATION,
    hostParts: parts,
    date,
    hidden: isActionsRestricted(activeProfile),
  })
  await hosting.setStatus(activeProfileId, HostingStatus.PENDING, note)
  // Do not send notification to recipient if requester is "Action Restricted"
  if (hosting.hidden) {
    return { hosting }
  }

  // STEP 3: Send an invitation email
  eventManager.emit(eventManager.events.HOSTING_EXTENDED, hosting)

  // STEP 4: Send an invitation notification
  await sendInviteNotifications(hosting, { activeProfileId })

  // STEP 5: Open a conversation for the invitation
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
