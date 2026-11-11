import { getActionBlockingProfileIds } from 'Connectors/blocking'
import models from 'Models'
import { messageNotificationTypes } from 'Models/notification'
import { NotificationStatus } from 'Models/notification/enums'

export async function unviewedNotificationsTotal(input, { activeProfileId }) {
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)
  const unviewedTotal = await models.Notification.countDocuments({
    profile: activeProfileId,
    triggeredBy: { $nin: profileIdsToBlock },
    status: NotificationStatus.NEW,
  })
  return { unviewedTotal }
}

export async function unviewedNonMessageNotificationTotal(
  input,
  { activeProfileId }
) {
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)
  const unviewedTotal = await models.Notification.countDocuments({
    profile: activeProfileId,
    triggeredBy: { $nin: profileIdsToBlock },
    status: NotificationStatus.NEW,
    type: { $nin: messageNotificationTypes },
    hidden: { $ne: true },
  })
  return { unviewedTotal }
}

export async function unviewedMessageNotificationTotal(
  input,
  { activeProfileId }
) {
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)
  const unviewedTotal = await models.Notification.countDocuments({
    profile: activeProfileId,
    triggeredBy: { $nin: profileIdsToBlock },
    status: NotificationStatus.NEW,
    type: { $in: messageNotificationTypes },
    hidden: { $ne: true },
  })
  return { unviewedTotal }
}
