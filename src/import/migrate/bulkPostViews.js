import { migrateBulkPostViews } from './utils/postViews'

/**
 * Triggered when process.env.MIGRATE = bulkPostViews
 *
 * Migrate bulk bulkPostViews
 */
export const bulkPostViews = async () => {
  await migrateBulkPostViews()
}
