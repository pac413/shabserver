import { migrateBulkProfileSettings } from './utils/profileSettings'

/**
 * Triggered when process.env.MIGRATE = bulkProfileSettings
 *
 * Migrate bulk bulkProfileSettings
 *
 * Used env variables:
 * - process.env.OFFSET (optional)
 * - process.env.LIMIT (optional)
 *
 * Flow:
 * - If any of OFFSET or LIMIT both are defined, imports partial set of bulkProfileSettings.
 * - If none of OFFSET nor LIMIT is defined, imports all bulkProfileSettings.
 */
export const bulkProfileSettings = async () => {
  const offset = process.env.OFFSET ? parseInt(process.env.OFFSET) : null
  const limit = process.env.LIMIT ? parseInt(process.env.LIMIT) : null
  await migrateBulkProfileSettings(offset, limit)
}
