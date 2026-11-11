import models from 'Models'

export default async function deleteHostings(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = { $or: [{ host: profileId }, { guest: profileId }] }
  if (shouldHardDelete) {
    await models.Hosting.deleteMany(whereOptions)
  } else {
    await models.Hosting.delete(whereOptions).exec()
  }
}
