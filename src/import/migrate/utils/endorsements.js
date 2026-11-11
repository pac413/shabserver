import Promise from 'bluebird'
import moment from 'moment'
import { importEndorsements } from 'Import/common/endorsements/importEndorsements'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial endorsements indicated by `offset` and `limit` from api
 */
const migratePartialEndorsements = async (offset, limit) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_ENDORSEMENTS',
    message: `Starting to migrate ${limit} endorsements from ${offset} at ${importedAt}`,
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
    event: 'BULK_ENDORSEMENTS',
    message: `Loaded ${profileIds.length} endorsements from database`,
    profileIds,
  })

  await Promise.map(
    profileIds,
    async (profileId, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_ENDORSEMENTS',
        message: `${gIndex}: Starting to migrate endorsements for profile ${profileId}`,
        profileId,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.endorsements.loadSingle(profileId, {
          before,
          after,
        })
        console.info({
          event: 'API_ENDORSEMENTS',
          message: `${gIndex}: Loaded endorsements ${profileId} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load endorsements ${profileId}`
        console.error({
          event: 'API_ENDORSEMENTS',
          message: msg,
          profileId,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_ENDORSEMENTS',
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
        await importEndorsements(data, profileId, importedAt)
        console.info({
          event: 'BULK_ENDORSEMENTS',
          message: `${gIndex}: Completed to migrate endorsements for profile ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_ENDORSEMENTS',
          status: 'success',
          index: gIndex,
          profileId,
        })
        report.success.push({ index: gIndex, profileId })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate endorsements for profile ${profileId}`
        console.error({
          event: 'BULK_ENDORSEMENTS',
          message,
          profileId,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_ENDORSEMENTS',
          status: 'failed',
          index: gIndex,
          data,
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
    event: 'BULK_ENDORSEMENTS',
    message: `Completed to migrate ${profileIds.length} endorsements from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSingleEndorsements = async (profileId) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  console.log({
    event: 'SINGLE_ENDORSEMENTS',
    message: `Starting to migrate endorsements for profile ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })

  const data = await migrateApi.endorsements.loadSingle(profileId, {
    before,
    after,
  })
  await importEndorsements(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_ENDORSEMENTS',
    message: `Completed to migrate endorsements for profile ${profileId} at ${importedAt}`,
    profileId,
    before,
    after,
    importedAt,
  })
}

/**
 * Migrate all the endorsements from api
 */
export const migrateBulkEndorsements = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_ENDORSEMENTS',
      message: 'Starting to bulk-migrate partial endorsements',
    })
    const result = await migratePartialEndorsements(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_ENDORSEMENTS',
      message: `Completed to bulk-migrate partial ${result.migrated} endorsements`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_ENDORSEMENTS',
      message: 'Starting to migrate all endorsements',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialEndorsements(offset, limit)
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
      event: 'BULK_ENDORSEMENTS',
      message: `Completed migration for all ${offset} endorsements`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_ENDORSEMENTS',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
  })
}
