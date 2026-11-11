import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'

export async function updateNotificationStatus(input, { activeProfileId }) {
  const { notificationId, status } = input
  const notification = await models.Notification.findById(notificationId)
  if (!notification) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_NOTIFICATION_ID, {
      notificationId,
    })
  }

  if (notification.profile !== activeProfileId) {
    throw new ForbiddenError(ERRORS_BY_CODE.UPDATE_NOTIFICATION_FORBIDDEN, {
      notificationId,
    })
  }

  notification.status = status

  await notification.save()
  return notification
}
