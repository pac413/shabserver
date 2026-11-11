import models from 'Models'

export async function restoreBlockings(profileId) {
  const whereOptions = {
    $or: [{ profileId: profileId }, { blockedProfileId: profileId }],
  }
  await models.Blocking.restore(whereOptions).exec()
}
