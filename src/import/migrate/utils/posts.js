import Promise from 'bluebird'
import moment from 'moment'
import { importPosts } from 'Import/common/posts/importPosts'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial posts indicated by `offset` and `limit` from api
 */
const migratePartialPosts = async (offset, limit) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_POSTS',
    message: `Starting to migrate ${limit} posts from ${offset} at ${importedAt}`,
    offset,
    limit,
    before,
    after,
    importedAt,
  })

  const profiles = await models.Profile.find()
    .sort({ createdAt: 1 })
    .skip(offset)
    .limit(limit)
    .select({ _id: 1 })
    .lean()
  const profileIds = profiles.map(({ _id }) => _id)
  console.info({
    event: 'BULK_POSTS',
    message: `Loaded ${profileIds.length} posts from database`,
    profileIds,
  })

  await Promise.map(
    profileIds,
    async (profileId, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_POSTS',
        message: `${gIndex}: Starting to migrate posts for profile ${profileId}`,
        profileId,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.posts.loadAllPostsByProfileId(profileId, {
          before,
          after,
        })
        console.info({
          event: 'API_POSTS',
          message: `${gIndex}: Loaded posts ${profileId} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load posts ${profileId}`
        console.error({
          event: 'API_POSTS',
          message: msg,
          profileId,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_POSTS',
          status: 'failed',
          index: gIndex,
          profileId,
          err,
        })
        report.failed.push({
          index: gIndex,
          profileId,
        })
        return
      }

      try {
        await importPosts(data, profileId, importedAt)
        console.info({
          event: 'BULK_POSTS',
          message: `${gIndex}: Completed to migrate posts for profile ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_POSTS',
          status: 'success',
          index: gIndex,
          profileId,
        })
        report.success.push({ index: gIndex, profileId })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate posts for profile ${profileId}`
        console.error({
          event: 'BULK_POSTS',
          message,
          profileId,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_POSTS',
          status: 'failed',
          index: gIndex,
          size: data.length,
          profileId,
          err,
        })
      }
    },
    {
      concurrency: 10,
    }
  )

  console.info({
    event: 'BULK_POSTS',
    message: `Completed to migrate ${profileIds.length} posts from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSinglePosts = async (profileId) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  console.log({
    event: 'SINGLE_POSTS',
    message: `Starting to migrate posts for profile ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })

  const data = await migrateApi.posts.loadAllPostsByProfileId(profileId, {
    before,
    after,
  })
  await importPosts(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_POSTS',
    message: `Completed to migrate posts for profile ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })
}

/**
 * Migrate all the posts from api
 */
export const migrateBulkPosts = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_POSTS',
      message: 'Starting to bulk-migrate partial posts',
    })
    const result = await migratePartialPosts(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_POSTS',
      message: `Completed to bulk-migrate partial ${result.migrated} posts`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_POSTS',
      message: 'Starting to migrate all posts',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialPosts(offset, limit)
      countLoaded = result.migrated
      report.totalSuccess += result.report.success.length
      report.totalFailed += result.report.failed.length
      if (countLoaded === 0 || (pLimit && pLimit <= limit)) {
        break
      }
      offset += countLoaded
      if (pLimit) {
        pLimit -= limit
      }
    }
    console.log({
      event: 'BULK_POSTS',
      message: `Completed migration for all ${offset} posts`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_POSTS',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
  })
}
