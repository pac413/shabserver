import Promise from 'bluebird'
import moment from 'moment'
import { importFriendships } from 'Import/common/friendships/importFriendships'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial friendships indicated by `offset` and `limit` from api
 */
const migratePartialFriendships = async (offset, limit) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_FRIENDSHIPS',
    message: `Starting to migrate ${limit} friendships from ${offset} at ${importedAt}`,
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
    event: 'BULK_FRIENDSHIPS',
    message: `Loaded ${profileIds.length} profiles from database`,
    profileIds,
  })

  await Promise.map(
    profileIds,
    async (profileId, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_FRIENDSHIPS',
        message: `${gIndex}: Starting to migrate friendships for profile ${profileId}`,
        profileId,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.friendships.loadSingle(profileId, {
          before,
          after,
        })
        console.info({
          event: 'API_FRIENDSHIPS',
          message: `${gIndex}: Loaded friendships ${profileId} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load friendships ${profileId}`
        console.error({
          event: 'API_FRIENDSHIPS',
          message: msg,
          profileId,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_FRIENDSHIPS',
          status: 'failed',
          index: gIndex,
          profileId,
          err,
        })
        return
      }

      try {
        await importFriendships(data, profileId, importedAt)
        console.info({
          event: 'BULK_FRIENDSHIPS',
          message: `${gIndex}: Completed to migrate friendships for profile ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_FRIENDSHIPS',
          status: 'success',
          index: gIndex,
          profileId,
        })
        report.success.push({ index: gIndex, profileId })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate friendships for profile ${profileId}`
        console.error({
          event: 'BULK_FRIENDSHIPS',
          message,
          profileId,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_FRIENDSHIPS',
          status: 'failed',
          index: gIndex,
          data,
          profileId,
          err,
        })
        report.failed.push({ index: gIndex, profileId })
      }
    },
    {
      concurrency: 10,
    }
  )

  console.info({
    event: 'BULK_FRIENDSHIPS',
    message: `Completed to migrate ${profileIds.length} friendships from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSingleFriendships = async (profileId) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  console.log({
    event: 'SINGLE_FRIENDSHIPS',
    message: `Starting to migrate friendships for profile ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })

  const data = await migrateApi.friendships.loadSingle(profileId, {
    before,
    after,
  })
  await importFriendships(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_FRIENDSHIPS',
    message: `Completed to migrate friendships for profile ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })
}

/**
 * Migrate all the friendships from api
 */
export const migrateBulkFriendships = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_FRIENDSHIPS',
      message: 'Starting to bulk-migrate partial friendships',
    })
    const result = await migratePartialFriendships(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_FRIENDSHIPS',
      message: `Completed to bulk-migrate partial ${result.migrated} friendships`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_FRIENDSHIPS',
      message: 'Starting to migrate all friendships',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialFriendships(offset, limit)
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
      event: 'BULK_FRIENDSHIPS',
      message: `Completed migration for all ${offset} friendships`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_FRIENDSHIPS',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
  })
}
