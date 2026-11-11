import { migrateSingleEndorsements } from './utils/endorsements'

/**
 * Triggered when process.env.MIGRATE=endorsements
 *
 * Migrate endorsements
 * - Endorsements
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const endorsements = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'ENDORSEMENTS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleEndorsements(profileId)
}
