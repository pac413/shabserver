import { migrateSingleReferences } from './utils/references'

/**
 * Triggered when process.env.MIGRATE=references
 *
 * Migrate references
 * - ProfileView
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const references = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'REFERENCES',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleReferences(profileId)
}
