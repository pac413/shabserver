import { migrateSingleHostings } from './utils/hostings'

/**
 * Triggered when process.env.MIGRATE=hostings
 *
 * Migrate hostings
 * - Hostings
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const hostings = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'HOSTINGS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleHostings(profileId)
}
