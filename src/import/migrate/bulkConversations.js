import { migrateBulkConversations } from './utils/conversations'

/**
 * Triggered when process.env.MIGRATE = bulkConversations
 *
 * Migrate bulk bulkConversations
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkConversations.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkConversations.
 */
export const bulkConversations = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkConversations(offset, limit)
}
