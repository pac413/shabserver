import { migrateBulkPostViewsCount } from './utils/postViewsCount'

/**
 * Triggered when process.env.MIGRATE = bulkPostViewsCount
 *
 * Migrate bulk bulkPostViewsCount
 */
export const bulkPostViewsCount = async () => {
  await migrateBulkPostViewsCount()
}
