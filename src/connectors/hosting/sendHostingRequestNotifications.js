import moment from 'moment'
import { createNewNotification } from 'Connectors/notification'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { getProfileUrl } from 'Utils/profile'

export default async function sendHostingRequestNotifications(
  hosting,
  { activeProfileId }
) {
  const guest = await simpleProfileLoader.load(hosting.guest)

  // send hosting request to the host
  await createNewNotification(
    {
      profile: hosting.host,
      triggeredBy: activeProfileId,
      type: NotificationType.HOSTING_REQUEST,
      title: { name: 'notification.new-host-request.title' },
      content: {
        name: 'notification.new-host-request.content',
        variables: {
          profileUrl: getProfileUrl(guest),
          firstName: guest.firstName,
          lastName: guest.lastName,
        },
      },
      status: NotificationStatus.NEW,
      referenceId: hosting.id,
      actions: [
        {
          name: 'Decline',
          label: { name: 'notification.new-host-request.decline' },
          style: NotificationActionStyle.SECONDARY,
          type: NotificationActionType.DELETE_HOSTING_REQUEST,
          payload: {
            requestId: hosting.id,
            profileId: activeProfileId,
          },
          actionUrl: `/action/hosting/decline/${hosting.id}`,
        },
        {
          name: 'Accept',
          label: { name: 'notification.new-host-request.accept' },
          style: NotificationActionStyle.PRIMARY,
          type: NotificationActionType.ACCEPT_HOSTING_REQUEST,
          payload: {
            requestId: hosting.id,
            profileId: activeProfileId,
          },
          actionUrl: `/action/hosting/accept/${hosting.id}`,
        },
        {
          name: 'View Invite',
          label: { name: 'notification.new-host-request.view-invite' },
          style: NotificationActionStyle.LINK,
          type: NotificationActionType.RESPOND_HOSTING_REQUEST,
          payload: hosting,
          actionUrl: `/planner/host/${moment
            .utc(hosting.date)
            .format('YYYY-MM-DD')}/${hosting.id}`,
        },
      ],
    },
    hosting
  )
}
