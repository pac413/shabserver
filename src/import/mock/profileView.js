import moment from 'moment'
import { importProfileViews } from 'Import/common/profileViews/importProfileViews'
import { randomProfileId } from 'Import/mock/fake'
import models from 'Models'

const importFakeProfileViews = async (profile, existingProfilesIds) => {
  const importedAt = moment.utc().toDate()
  const totalViews = profile.metrics ? profile.metrics.views : 0
  if (totalViews.length === 0) {
    return
  }
  console.log(`faking ${totalViews} profile views for ${profile._id}`)
  const fakedProfileViews = Array.from({ length: totalViews }, () => ({
    viewer: randomProfileId(existingProfilesIds, [profile._id]),
  }))

  return importProfileViews(fakedProfileViews, profile._id, importedAt)
}

export const runProfileViewsImport = async () => {
  const profiles = await models.Profile.find({}).select({ metrics: 1 }).lean()
  const existingProfilesIds = profiles.map((p) => p._id)
  console.log(`faking profile views for ${profiles.length} profiles`)
  await models.ProfileView.deleteMany({})

  for (const profile of profiles) {
    await importFakeProfileViews(profile, existingProfilesIds)
  }

  console.log('faked profile views')
}
