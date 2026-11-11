import models from 'Models'

export async function deleteMutedConnections(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = {
    $or: [{ profileId: profileId }, { mutedProfileId: profileId }],
  }
  if (shouldHardDelete) {
    await models.MutedConnection.deleteMany(whereOptions)
  } else {
    await models.MutedConnection.delete(whereOptions).exec()
  }
}
