import models from 'Models'

export default async function restoreHostings(profileId) {
  const whereOptions = {
    $or: [{ host: profileId }, { guest: profileId }],
  }
  await models.Hosting.restore(whereOptions).exec()
}
