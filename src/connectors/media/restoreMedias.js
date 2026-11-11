import models from 'Models'

export async function restoreMedias(profileId) {
  const whereOptions = { ownerId: profileId }
  await models.Media.restore(whereOptions).exec()
}
