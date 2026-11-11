import {
  createEndorsementRequestNotification,
  sendEndorsementRequestEmails,
} from 'Connectors/endorsement'
import { dismissNotification } from 'Connectors/notification'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { eventManager } from 'Events'
import models from 'Models'
import { HostingStatus, HostingType } from 'Models/hosting/enums'
import checkCanAcceptHosting from './checkCanAcceptHosting'
import sendHostingAcceptedNotification from './sendHostingAcceptedNotification'

export default async function acceptHosting(input, context) {
  const { id, note, parts } = input
  const { activeProfileId } = context

  const hosting = await models.Hosting.findById(id)

  await checkCanAcceptHosting(hosting, { activeProfileId })

  await hosting.setStatus(activeProfileId, HostingStatus.ACCEPTED, note)

  if (hosting.type === HostingType.INVITATION) {
    hosting.guestParts = parts || hosting.hostParts
  } else {
    hosting.hostParts = parts || hosting.guestParts
  }

  await hosting.save()
  eventManager.emit(eventManager.events.HOSTING_ACCEPTED, hosting)
  await sendHostingAcceptedNotification(hosting)
  await dismissNotification({ referenceId: id })

  if (
    ['local', 'development', 'staging', 'uat'].includes(process.env.NODE_ENV)
  ) {
    const [hostProfile, guestProfile] = await Promise.all([
      simpleProfileLoader.load(hosting.host),
      simpleProfileLoader.load(hosting.guest),
    ])
    await Promise.all([
      createEndorsementRequestNotification({
        hosting,
        hostProfile,
        guestProfile,
      }),
      sendEndorsementRequestEmails({
        hostProfile,
        guestProfile,
      }),
    ])
  }
  return { hosting }
}
