import { dismissNotification } from 'Connectors/notification'
import { eventManager } from 'Events'
import models from 'Models'
import { HostingStatus } from 'Models/hosting/enums'
import checkCanDeclineHosting from './checkCanDeclineHosting'
import sendHostingDeclinedNotification from './sendHostingDeclinedNotification'

export default async function declineHosting(input, context) {
  const { id, note } = input
  const { activeProfileId } = context

  const hosting = await models.Hosting.findById(id)

  await checkCanDeclineHosting(hosting, {
    activeProfileId,
  })

  await hosting.setStatus(activeProfileId, HostingStatus.DECLINED, note)

  eventManager.emit(eventManager.events.HOSTING_DECLINED, hosting)
  await sendHostingDeclinedNotification(hosting)
  await dismissNotification({ referenceId: id })

  return { hosting }
}
