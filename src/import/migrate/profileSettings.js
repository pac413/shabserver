import { migrateSingleProfileSettings } from './utils/profileSettings'

/**
 * Triggered when process.env.MIGRATE=profileSettings
 *
 * Migrate profileSettings
 * - Profile Settings
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const profileSettings = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'PROFILESETTINGS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleProfileSettings(profileId)
}
