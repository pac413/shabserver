import models from 'Models'

export const deleteEndorsementRequestNotification = async (
  { hostingId, type },
  { activeProfileId }
) => {
  await models.Notification.deleteMany({
    type,
    referenceId: hostingId,
    profile: activeProfileId,
  })
}
