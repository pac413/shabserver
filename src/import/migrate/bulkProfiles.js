import { difference } from 'lodash'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'
import { migrateBulkProfiles, migrateSingleProfile } from './utils/profile'

/**
 * Triggered when process.env.MIGRATE = bulkProfiles
 *
 * Migrate bulk bulkProfiles
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkProfiles.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkProfiles.
 */
export const bulkProfiles = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkProfiles(offset, limit)
}

export const missingProfiles = async () => {
  const allProfileIds = await migrateApi.profile.loadProfileIds()
  const existingProfiles = await models.Profile.find().select({ _id: 1 }).lean()
  const existingProfileIds = existingProfiles.map(({ _id }) => _id)
  const missingProfileIds = difference(allProfileIds, existingProfileIds)

  console.info({
    event: 'MISSING_PROFILES',
    existingProfileIds,
    missingProfileIds,
  })
  console.info({
    event: 'MISSING_PROFILES',
    allProfileIds: allProfileIds.length,
    existingProfileIds: existingProfileIds.length,
    missingProfileIds,
  })

  for (const profileId of missingProfileIds) {
    await migrateSingleProfile(profileId)
  }
}
