import models from 'Models'

export async function restoreMutedConnections(profileId) {
  const whereOptions = {
    $or: [{ profileId: profileId }, { mutedProfileId: profileId }],
  }
  await models.MutedConnection.restore(whereOptions).exec()
}
