import models from 'Models'
import { HostingStatus, HostingType } from 'Models/hosting/enums'
import { isActionsRestricted } from 'Connectors/user'
// import { createConversationForHosting } from 'Connectors/conversations'
import { sendInviteNotifications } from 'Connectors/hosting'
import { jobQueue } from 'Jobs/jobQueue'
import { checkHostingAccess, checkGuestAccess } from './helpers'

export default async function bulkInvitations(input, context) {
  const { guests, parts, date, note } = input
  const { activeProfileId } = context

  // STEP 1.1: Check if the activeProfile is allowed for hosting
  await checkHostingAccess(activeProfileId, true)

  // STEP 1.2: Check if guests are allowed to be invited by the activeProfile
  let allowedGuests = await Promise.all(
    guests.map(async (guest) => {
      try {
        await checkGuestAccess(activeProfileId, guest)
        return guest
      } catch (err) {
        // Nothing to do with the disallowed guests
        return null
      }
    })
  )
  allowedGuests = allowedGuests.filter((guest) => !!guest)

  // STEP 2: Create hosting records with the status as PENDING
  const activeProfile = await models.Profile.findById(activeProfileId)
    .select({ restrictions: 1 })
    .lean()
  const hostings = await Promise.all(
    allowedGuests.map(async (guest) => {
      const hosting = await models.Hosting.create({
        host: activeProfileId,
        guest,
        type: HostingType.INVITATION,
        hostParts: parts,
        date,
        hidden: isActionsRestricted(activeProfile),
      })
      await hosting.setStatus(activeProfileId, HostingStatus.PENDING, note)
      return hosting
    })
  )

  // STEP 3: Filter out hidden hostings whose requester is "Action Restricted"
  const activeHostings = hostings.filter((hosting) => !hosting.hidden)

  // STEP 4: Send invitation emails for activeHostings
  await jobQueue.add(jobQueue.jobs.SendInvitationEmails, {
    hostings: activeHostings,
  })

  // STEP 5: Send notifications and open conversations for activeHostings
  await Promise.all(
    activeHostings.map(async (hosting) => {
      // Step 5.1: Send an invitation notification
      await sendInviteNotifications(hosting, { activeProfileId })

      /**
       * Comment Step 5.2 until we find out a clean solution to open a conversation on guest side only
       *
       * // Step 5.2: Open a conversation for the invitation
       * await createConversationForHosting(
       *   {
       *     hosting,
       *     note,
       *     isSendingNewHostingMessage: true,
       *   },
       *   context
       * )
       */
    })
  )

  return { hostings }
}
