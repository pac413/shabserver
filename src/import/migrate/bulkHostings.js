import { migrateBulkHostings } from './utils/hostings'

/**
 * Triggered when process.env.MIGRATE = bulkHostings
 *
 * Migrate bulk bulkHostings
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkHostings.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkHostings.
 */
export const bulkHostings = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkHostings(offset, limit)
}
