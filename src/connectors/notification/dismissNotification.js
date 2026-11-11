import models from 'Models'
import { NotificationStatus } from 'Models/notification/enums'

export async function dismissNotification(input) {
  const { referenceId } = input

  if (!referenceId) {
    return
  }

  const notification = await models.Notification.findOne({
    referenceId,
  })
  if (!notification) {
    console.error('Unable to dismiss notification', referenceId)
    return
  }

  notification.status = NotificationStatus.DISMISSED

  await notification.save()
  return notification
}
