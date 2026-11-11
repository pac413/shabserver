import { migrateBulkPostViews } from './utils/postViews'

/**
 * Triggered when process.env.MIGRATE = postViews
 *
 * Migrate single posts
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const postViews = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'POST_VIEWS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateBulkPostViews(process.env.PROFILE_ID)
}
