import models from 'Models'
import { messageNotificationTypes } from 'Models/notification'

export async function unhideMessageNotifications(profileId) {
  await models.Notification.updateMany(
    {
      $or: [{ profile: profileId }, { triggeredBy: profileId }],
      type: { $in: messageNotificationTypes },
    },
    { $set: { hidden: false } }
  )
}
