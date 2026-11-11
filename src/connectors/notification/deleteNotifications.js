import models from 'Models'

export async function deleteNotifications(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ profile: profileId }, { triggeredBy: profileId }],
  }
  if (shouldHardDelete) {
    await models.Notification.deleteMany(whereOptions)
  } else {
    await models.Notification.delete(whereOptions).exec()
  }
}
