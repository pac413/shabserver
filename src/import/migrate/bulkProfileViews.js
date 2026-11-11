import { migrateBulkProfileViews } from './utils/profileViews'

/**
 * Triggered when process.env.MIGRATE = bulkProfileViews
 *
 * Migrate bulk bulkProfileViews
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkProfileViews.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkProfileViews.
 */
export const bulkProfileViews = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkProfileViews(offset, limit)
}
