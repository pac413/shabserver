import models from 'Models'

export async function deleteBlockings(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ profileId: profileId }, { blockedProfileId: profileId }],
  }
  if (shouldHardDelete) {
    await models.Blocking.deleteMany(whereOptions)
  } else {
    await models.Blocking.delete(whereOptions).exec()
  }
}
