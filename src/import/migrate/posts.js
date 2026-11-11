import { migrateSinglePosts } from './utils/posts'

/**
 * Triggered when process.env.MIGRATE = posts
 *
 * Migrate single posts
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const posts = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'POSTS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSinglePosts(process.env.PROFILE_ID)
}
