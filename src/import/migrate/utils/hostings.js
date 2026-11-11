import Promise from 'bluebird'
import moment from 'moment'
import { importHostings } from 'Import/common/hostings/importHostings'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial hostings indicated by `offset` and `limit` from api
 */
const migratePartialHostings = async (offset, limit) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_HOSTINGS',
    message: `Starting to migrate ${limit} hostings from ${offset} at ${importedAt}`,
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
    event: 'BULK_HOSTINGS',
    message: `Loaded ${profileIds.length} profiles from database`,
    profileIds,
  })

  await Promise.map(
    profileIds,
    async (profileId, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_HOSTINGS',
        message: `${gIndex}: Starting to migrate hostings for profile ${profileId}`,
        profileId,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.hostings.loadSingle(profileId, {
          before,
          after,
        })
        console.info({
          event: 'API_HOSTINGS',
          message: `${gIndex}: Loaded hostings ${profileId} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load hostings ${profileId}`
        console.error({
          event: 'API_HOSTINGS',
          message: msg,
          profileId,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_HOSTINGS',
          status: 'failed',
          index: gIndex,
          profileId,
          err,
        })
        return
      }

      try {
        await importHostings(data, profileId, importedAt)
        console.info({
          event: 'BULK_HOSTINGS',
          message: `${gIndex}: Completed to migrate hostings for profile ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_HOSTINGS',
          status: 'success',
          index: gIndex,
          profileId,
        })
        report.success.push({ index: gIndex, profileId })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate hostings for profile ${profileId}`
        console.error({
          event: 'BULK_HOSTINGS',
          message,
          profileId,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_HOSTINGS',
          status: 'failed',
          index: gIndex,
          size: data.length,
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
    event: 'BULK_HOSTINGS',
    message: `Completed to migrate ${profileIds.length} hostings from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSingleHostings = async (profileId) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  console.log({
    event: 'SINGLE_HOSTINGS',
    message: `Starting to migrate hostings for profile ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })

  const data = await migrateApi.hostings.loadSingle(profileId, {
    before,
    after,
  })
  await importHostings(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_HOSTINGS',
    message: `Completed to migrate hostings for prof ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })
}

/**
 * Migrate all the hostings from api
 */
export const migrateBulkHostings = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_HOSTINGS',
      message: 'Starting to bulk-migrate partial hostings',
    })
    const result = await migratePartialHostings(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_HOSTINGS',
      message: `Completed to bulk-migrate partial ${result.migrated} hostings`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_HOSTINGS',
      message: 'Starting to migrate all hostings',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialHostings(offset, limit)
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
      event: 'BULK_HOSTINGS',
      message: `Completed migration for all ${offset} hostings`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_HOSTINGS',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
  })
}
