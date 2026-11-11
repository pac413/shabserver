import { createNewNotification } from 'Connectors/notification'
import {
  NotificationActionStyle,
  NotificationActionType,
  NotificationStatus,
  NotificationType,
} from 'Models/notification/enums'
import { FRONTEND_URL } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'

export const createEndorsementRequestNotification = async ({
  hosting,
  hostProfile,
  guestProfile,
}) => {
  await Promise.all([
    createNewNotification({
      profile: guestProfile._id,
      triggeredBy: hostProfile._id,
      type: NotificationType.HOST_ENDORSEMENT_REQUEST,
      title: { name: 'notification.host-endorsement-request.title' },
      content: {
        name: 'notification.host-endorsement-request.content',
        variables: {
          profileUrl: getProfileUrl(hostProfile),
          firstName: hostProfile.firstName,
          lastName: hostProfile.lastName,
        },
      },
      status: NotificationStatus.NEW,
      referenceId: hosting._id,
      actions: [
        {
          name: 'Accept',
          label: { name: 'notification.host-endorsement-request.accept' },
          style: NotificationActionStyle.PRIMARY,
          type: NotificationActionType.ACCEPT_HOST_ENDORSEMENT_REQUEST,
          payload: {
            hostingId: hosting._id,
            profileHandle: hostProfile.handle,
          },
          actionUrl: `${FRONTEND_URL}/action/host-endorsement-request/accept/${hosting._id}`,
        },
      ],
    }),
    createNewNotification({
      profile: hostProfile._id,
      triggeredBy: guestProfile._id,
      type: NotificationType.GUEST_ENDORSEMENT_REQUEST,
      title: { name: 'notification.guest-endorsement-request.title' },
      content: {
        name: 'notification.guest-endorsement-request.content',
        variables: {
          profileUrl: getProfileUrl(guestProfile),
          firstName: guestProfile.firstName,
          lastName: guestProfile.lastName,
        },
      },
      status: NotificationStatus.NEW,
      referenceId: hosting._id,
      actions: [
        {
          name: 'Accept',
          label: { name: 'notification.guest-endorsement-request.accept' },
          style: NotificationActionStyle.PRIMARY,
          type: NotificationActionType.ACCEPT_GUEST_ENDORSEMENT_REQUEST,
          payload: {
            hostingId: hosting._id,
            profileHandle: guestProfile.handle,
          },
          actionUrl: `${FRONTEND_URL}/action/guest-endorsement-request/accept/${hosting._id}`,
        },
      ],
    }),
  ])
}
