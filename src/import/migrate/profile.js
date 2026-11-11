import { migrateSingleProfile } from './utils/profile'

/**
 * Triggered when process.env.MIGRATE=profile
 *
 * Migrate profile
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
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const profile = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'PROFILE',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleProfile(profileId)
}
