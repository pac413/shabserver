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

export default async function sendInviteNotifications(
  hosting,
  { activeProfileId }
) {
  const host = await simpleProfileLoader.load(activeProfileId)

  // send invite notification to the guest
  await createNewNotification(
    {
      profile: hosting.guest,
      triggeredBy: activeProfileId,
      type: NotificationType.INVITE_REQUEST,
      title: { name: 'notification.new-invite.title' },
      content: {
        name: 'notification.new-invite.content',
        variables: {
          profileUrl: getProfileUrl(host),
          firstName: host.firstName,
          lastName: host.lastName,
        },
      },
      status: NotificationStatus.NEW,
      referenceId: hosting.id,
      actions: [
        {
          name: 'Decline',
          label: { name: 'notification.new-invite.decline' },
          style: NotificationActionStyle.SECONDARY,
          type: NotificationActionType.DELETE_INVITE_REQUEST,
          payload: {
            requestId: hosting.id,
            profileId: activeProfileId,
          },
          actionUrl: `/action/hosting/decline/${hosting.id}`,
        },
        {
          name: 'Accept',
          label: { name: 'notification.new-invite.accept' },
          style: NotificationActionStyle.PRIMARY,
          type: NotificationActionType.ACCEPT_INVITE_REQUEST,
          payload: {
            requestId: hosting.id,
            profileId: activeProfileId,
          },
          actionUrl: `/action/hosting/accept/${hosting.id}`,
        },
        {
          name: 'View Invite',
          label: { name: 'notification.new-invite.view-invite' },
          style: NotificationActionStyle.LINK,
          type: NotificationActionType.RESPOND_INVITE_REQUEST,
          payload: hosting,
          actionUrl: `/planner/guest/${moment
            .utc(hosting.date)
            .format('YYYY-MM-DD')}/${hosting.id}`,
        },
      ],
    },
    hosting
  )
}
