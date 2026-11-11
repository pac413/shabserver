import Promise from 'bluebird'
import moment from 'moment'
import { randomProfileId } from 'Import/mock/fake'
import models from 'Models'
import { importEndorsements } from 'Import/common/endorsements/importEndorsements'

const importFakeEndorsementsForSiteRole = async (
  profile,
  siteRole,
  existingProfilesIds
) => {
  const importedAt = moment.utc().toDate()
  const fakedEndorsements = Array.from({ length: 5 }, () => ({
    endorser: randomProfileId(existingProfilesIds, [profile._id]),
    profile: profile._id,
    onSiteRole: siteRole,
  }))

  return importEndorsements(fakedEndorsements, profile._id, importedAt)
}

export const runEndorsementsImport = async () => {
  const profiles = await models.Profile.find({}).lean()
  const existingProfilesIds = profiles.map((p) => p._id)
  console.log(`faking endorsements for ${profiles.length} profiles`)
  await models.Endorsement.deleteMany({})
  await Promise.map(
    profiles,
    (profile) =>
      Promise.map(profile.siteRoles, async (siteRole) => {
        return importFakeEndorsementsForSiteRole(
          profile,
          siteRole,
          existingProfilesIds
        )
      }),
    {
      concurrency: 1,
    }
  )
  console.log('faked endorsements')
}
