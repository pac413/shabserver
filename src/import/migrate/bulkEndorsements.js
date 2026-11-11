import { migrateBulkEndorsements } from './utils/endorsements'

/**
 * Triggered when process.env.MIGRATE = bulkEndorsements
 *
 * Migrate bulk bulkEndorsements
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkEndorsements.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkEndorsements.
 */
export const bulkEndorsements = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkEndorsements(offset, limit)
}
