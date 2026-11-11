import { getActionBlockingProfileIds } from 'Connectors/blocking'
import models from 'Models'
import { messageNotificationTypes } from 'Models/notification'
import { NotificationStatus } from 'Models/notification/enums'

export async function getNotifications(
  input,
  { activeProfileId },
  options = {}
) {
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)

  const { limit, offset, includeDismissed } = input
  const match = {
    profile: activeProfileId,
    triggeredBy: { $nin: profileIdsToBlock },
    status: {
      $in: [
        NotificationStatus.READ,
        NotificationStatus.VIEWED,
        NotificationStatus.NEW,
        ...(includeDismissed ? [NotificationStatus.DISMISSED] : []),
      ],
    },
    hidden: { $ne: true },
    ...options,
  }
  const total = await models.Notification.countDocuments(match)
  const unviewedTotal = await models.Notification.countDocuments({
    profile: activeProfileId,
    triggeredBy: { $nin: profileIdsToBlock },
    status: NotificationStatus.NEW,
    hidden: { $ne: true },
    ...options,
  })
  if (total === 0) {
    return { total, unviewedTotal, notifications: [] }
  }

  const notifications = await models.Notification.find(match)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)

  return { total, unviewedTotal, notifications }
}

export async function getNonMessageNotifications(input, context) {
  let options = {
    type: {
      $nin: messageNotificationTypes,
    },
  }
  if (input.types) {
    options = {
      type: {
        $in: input.types.filter(
          (type) => !messageNotificationTypes.includes(type)
        ),
      },
    }
  }
  return getNotifications(input, context, options)
}

export async function getMessageNotifications(input, context) {
  return getNotifications(input, context, {
    type: {
      $in: messageNotificationTypes,
    },
  })
}
