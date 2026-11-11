import { migrateBulkFriendships } from './utils/friendships'

/**
 * Triggered when process.env.MIGRATE = bulkFriendships
 *
 * Migrate bulk bulkFriendships
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkFriendships.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkFriendships.
 */
export const bulkFriendships = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkFriendships(offset, limit)
}
