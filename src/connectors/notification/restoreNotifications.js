import models from 'Models'

export async function restoreNotifications(profileId) {
  const whereOptions = {
    $or: [{ profile: profileId }, { triggeredBy: profileId }],
  }
  await models.Notification.restore(whereOptions).exec()
}
