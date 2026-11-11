import { migrateBulkPosts } from './utils/posts'

/**
 * Triggered when process.env.MIGRATE = bulkPosts
 *
 * Migrate bulk bulkPosts
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkPosts.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkPosts.
 */
export const bulkPosts = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkPosts(offset, limit)
}
