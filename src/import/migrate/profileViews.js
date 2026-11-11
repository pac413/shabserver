import { migrateSingleProfileViews } from './utils/profileViews'

/**
 * Triggered when process.env.MIGRATE=profileViews
 *
 * Migrate profileViews
 * - ProfileView
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const profileViews = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'PROFILEVIEWS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleProfileViews(profileId)
}
