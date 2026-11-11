import Promise from 'bluebird'
import moment from 'moment'
import { importMessages } from 'Import/common/messages/importMessages'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial messages indicated by `offset` and `limit` from api
 */
const migratePartialMessages = async (offset, limit) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_MESSAGES',
    message: `Starting to migrate ${limit} messages from ${offset} at ${importedAt}`,
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
    event: 'BULK_MESSAGES',
    message: `Loaded ${profileIds.length} messages from database`,
    profileIds,
  })

  await Promise.map(
    profileIds,
    async (profileId, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_MESSAGES',
        message: `${gIndex}: Starting to migrate messages for profile ${profileId}`,
        profileId,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.messages.loadSingle(profileId, {
          before,
          after,
        })
        console.info({
          event: 'API_MESSAGES',
          message: `${gIndex}: Loaded messages ${profileId} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load messages ${profileId}`
        console.error({
          event: 'API_MESSAGES',
          message: msg,
          profileId,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_MESSAGES',
          status: 'failed',
          index: gIndex,
          profileId,
          err,
        })
        report.failed.push({ index: gIndex, profileId })
        return
      }

      try {
        await importMessages(data, profileId, importedAt)
        console.info({
          event: 'BULK_MESSAGES',
          message: `${gIndex}: Completed to migrate messages for profile ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_MESSAGES',
          status: 'success',
          index: gIndex,
          profileId,
        })
        report.success.push({ index: gIndex, profileId })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate messages for profile ${profileId}`
        console.error({
          event: 'BULK_MESSAGES',
          message,
          profileId,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_MESSAGES',
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
    event: 'BULK_MESSAGES',
    message: `Completed to migrate ${profileIds.length} messages from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSingleMessages = async (profileId) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  console.log({
    event: 'SINGLE_MESSAGES',
    message: `Starting to migrate messages for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })

  const data = await migrateApi.messages.loadSingle(profileId, {
    before,
    after,
  })
  await importMessages(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_MESSAGES',
    message: `Completed to migrate messages for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })
}

/**
 * Migrate all the messages from api
 */
export const migrateBulkMessages = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_MESSAGES',
      message: 'Starting to bulk-migrate partial messages',
    })
    const result = await migratePartialMessages(pOffset || 0, pLimit)
    console.log(
      `[MESSAGES] Completed to bulk-migrate partial ${result.migrated} messages`
    )
    console.log({
      event: 'BULK_MESSAGES',
      message: `Completed to bulk-migrate partial ${result.migrated} messages`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log('[MESSAGES] Starting to migrate all messages')
    console.log({
      event: 'BULK_MESSAGES',
      message: 'Starting to migrate all messages',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialMessages(offset, limit)
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
    console.log(`[MESSAGES] Completed migration for all ${offset} messages`)
    console.log({
      event: 'BULK_MESSAGES',
      message: `Completed migration for all ${offset} messages`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_MESSAGES',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
  })
}
