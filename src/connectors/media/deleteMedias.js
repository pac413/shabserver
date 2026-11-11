import models from 'Models'

export async function deleteMedias(profileId, shouldHardDelete = false) {
  const whereOptions = { ownerId: profileId }
  if (shouldHardDelete) {
    await models.Media.deleteMany(whereOptions)
  } else {
    await models.Media.delete(whereOptions).exec()
  }
}
