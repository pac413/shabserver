import { migrateBulkReferences } from './utils/references'

/**
 * Triggered when process.env.MIGRATE = bulkReferences
 *
 * Migrate bulk bulkReferences
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkReferences.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkReferences.
 */
export const bulkReferences = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkReferences(offset, limit)
}
