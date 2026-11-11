import { createNewNotification } from 'Connectors/notification'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { HostingType } from 'Models/hosting/enums'
import { NotificationType, NotificationStatus } from 'Models/notification/enums'
import { getProfileUrl } from 'Utils/profile'

export default async function sendHostingDeclinedNotification(hosting) {
  if (hosting.type === HostingType.INVITATION) {
    // invitation declined, inform host
    const guest = await simpleProfileLoader.load(hosting.guest)

    await createNewNotification(
      {
        profile: hosting.host,
        triggeredBy: hosting.guest,
        type: NotificationType.INVITE_REQUEST_REJECTED,
        title: { name: 'notification.invite-declined.title' },
        content: {
          name: 'notification.invite-declined.content',
          variables: {
            profileUrl: getProfileUrl(guest),
            firstName: guest.firstName,
            lastName: guest.lastName,
          },
        },
        status: NotificationStatus.NEW,
        referenceId: hosting.id,
      },
      hosting
    )
  } else {
    // hosting declined accepted, inform guest
    const host = await simpleProfileLoader.load(hosting.host)

    await createNewNotification(
      {
        profile: hosting.guest,
        triggeredBy: hosting.host,
        type: NotificationType.HOSTING_REQUEST_APPROVED,
        title: { name: 'notification.host-declined.title' },
        content: {
          name: 'notification.host-declined.content',
          variables: {
            profileUrl: getProfileUrl(host),
            firstName: host.firstName,
            lastName: host.lastName,
          },
        },
        status: NotificationStatus.NEW,
        referenceId: hosting.id,
      },
      hosting
    )
  }
}
