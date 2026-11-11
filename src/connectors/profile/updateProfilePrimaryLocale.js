import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import models from 'Models'

export default async function updateProfilePrimaryLocale(
  primaryLocale,
  { activeProfileId }
) {
  await models.Profile.updateOne(
    { _id: activeProfileId },
    { $set: { primaryLocale } }
  )
  simpleProfileLoader.clear(activeProfileId)
}
