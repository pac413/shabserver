import Promise from 'bluebird'
import moment from 'moment'
import { importProfileViews } from 'Import/common/profileViews/importProfileViews'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial profileViews indicated by `offset` and `limit` from api
 */
const migratePartialProfileViews = async (offset, limit) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_PROFILEVIEWS',
    message: `Starting to migrate ${limit} profileViews from ${offset} at ${importedAt}`,
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
    event: 'BULK_PROFILEVIEWS',
    message: `Loaded ${profileIds.length} profileViews from database`,
    profileIds,
  })

  await Promise.map(
    profileIds,
    async (profileId, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_PROFILEVIEWS',
        message: `${gIndex}: Starting to migrate profileViews for profile ${profileId}`,
        profileId,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.profileViews.loadSingle(profileId, {
          before,
          after,
        })
        console.info({
          event: 'API_PROFILEVIEWS',
          message: `${gIndex}: Loaded profileViews ${profileId} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load profileViews ${profileId}`
        console.error({
          event: 'API_PROFILEVIEWS',
          message: msg,
          profileId,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_PROFILEVIEWS',
          status: 'failed',
          index: gIndex,
          profileId,
          err,
        })
        report.failed.push({ index: gIndex, profileId })
        return
      }

      try {
        await importProfileViews(data, profileId, importedAt)
        console.info({
          event: 'BULK_PROFILEVIEWS',
          message: `${gIndex}: Completed to migrate profileViews for profile ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_PROFILEVIEWS',
          status: 'success',
          index: gIndex,
          profileId,
        })
        report.success.push({ index: gIndex, profileId })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate profileViews for profile ${profileId}`
        console.error({
          event: 'BULK_PROFILEVIEWS',
          message,
          profileId,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_PROFILEVIEWS',
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
    event: 'BULK_PROFILEVIEWS',
    message: `Completed to migrate ${profileIds.length} profileViews from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSingleProfileViews = async (profileId) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  console.log({
    event: 'SINGLE_PROFILEVIEWS',
    message: `Starting to migrate profileViews for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })

  const data = await migrateApi.profileViews.loadSingle(profileId, {
    before,
    after,
  })
  await importProfileViews(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_PROFILEVIEWS',
    message: `Completed to migrate profileViews for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })
}

/**
 * Migrate all the profileViews from api
 */
export const migrateBulkProfileViews = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_PROFILEVIEWS',
      message: 'Starting to bulk-migrate partial profileViews',
    })
    const result = await migratePartialProfileViews(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_PROFILEVIEWS',
      message: `Completed to bulk-migrate partial ${result.migrated} profileViews`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_PROFILEVIEWS',
      message: 'Starting to migrate all profileViews',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialProfileViews(offset, limit)
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
      event: 'BULK_PROFILEVIEWS',
      message: `Completed migration for all ${offset} profileViews`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_PROFILEVIEWS',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
  })
}
