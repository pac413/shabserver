import { difference } from 'lodash'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'
import { migrateSingleEndorsements } from './utils/endorsements'
import { migrateSingleFriendships } from './utils/friendships'
import { migrateSingleHostings } from './utils/hostings'
import { migrateSingleMessages } from './utils/messages'
import { migrateSinglePosts } from './utils/posts'
import { migrateBulkPostViews } from './utils/postViews'
import { migrateSingleProfile } from './utils/profile'
import { migrateSingleProfileSettings } from './utils/profileSettings'
import { migrateSingleProfileViews } from './utils/profileViews'
import { migrateSingleReferences } from './utils/references'

/**
 * Triggered when process.env.MIGRATE = fullProfile
 *
 * Migrate profile and related data
 * - Profile
 *  * Profile
 *  * User
 *  * Avatar
 *  * Wallpaper
 *  * Pictures
 *  * HostProfile
 *  * GuestProfile
 *  * DatingProfile
 *  * References
 * - Profile Settings
 * - Endorsements
 * - Profile Views
 * - Friendships
 * - Hostings
 * - Messages
 * - Posts
 * - Post Views
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const migrateFullProfile = async (profileId) => {
  console.info({
    event: 'FULLPROFILE',
    message: `Starting to migrate Profile ${profileId} and related data`,
    profileId,
  })
  await migrateSingleProfile(profileId)
  await migrateSingleProfileSettings(profileId)
  await migrateSingleEndorsements(profileId)
  await migrateSingleReferences(profileId)
  await migrateSingleProfileViews(profileId)
  await migrateSingleFriendships(profileId)
  await migrateSingleHostings(profileId)
  await migrateSingleMessages(profileId)
  await migrateSinglePosts(profileId)
  await migrateBulkPostViews(profileId)
  console.info({
    event: 'FULLPROFILE',
    message: `Completed to migrate Profile ${profileId} and related data`,
    profileId,
  })
}

export const fullProfile = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'FULLPROFILE',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateFullProfile(profileId)
}

export const missingFullProfiles = async () => {
  const allProfileIds = await migrateApi.profile.loadProfileIds()
  const existingProfiles = await models.Profile.find().select({ _id: 1 }).lean()
  const existingProfileIds = existingProfiles.map(({ _id }) => _id)
  const missingProfileIds = difference(allProfileIds, existingProfileIds)

  console.info({
    event: 'MISSING_FULL_PROFILES',
    allProfileIds: allProfileIds.length,
    existingProfileIds: existingProfileIds.length,
    missingProfileIds,
  })

  for (const profileId of missingProfileIds) {
    await migrateFullProfile(profileId)
  }
}
