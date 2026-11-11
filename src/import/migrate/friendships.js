import { migrateSingleFriendships } from './utils/friendships'

/**
 * Triggered when process.env.MIGRATE=friendships
 *
 * Migrate friendships
 * - Friendships
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const friendships = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'FRIENDSHIPS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleFriendships(profileId)
}
