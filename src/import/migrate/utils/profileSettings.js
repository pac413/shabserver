import Promise from 'bluebird'
import moment from 'moment'
import { importProfileSettings } from 'Import/common/profileSettings/importProfileSettings'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial profile settings list indicated by `offset` and `limit` from api
 */
const migratePartialProfileSettings = async (offset, limit) => {
  const importedAt = moment.utc().toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_PROFILESETTINGS',
    message: `Starting to migrate ${limit} profile settings from ${offset} at ${importedAt}`,
    offset,
    limit,
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
    event: 'BULK_PROFILESETTINGS',
    message: `Loaded ${profileIds.length} profile settings from database`,
    offset,
    limit,
    importedAt,
  })

  await Promise.map(
    profileIds,
    async (profileId, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_PROFILESETTINGS',
        message: `${gIndex}: Starting to migrate profile settings for profile ${profileId}`,
        profileId,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.profileSettings.loadSingle(profileId)
        console.info({
          event: 'API_PROFILESETTINGS',
          message: `${gIndex}: Loaded profile settings ${profileId} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load profile settings ${profileId}`
        console.error({
          event: 'API_PROFILESETTINGS',
          message: msg,
          profileId,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_PROFILESETTINGS',
          status: 'failed',
          index: gIndex,
          profileId,
          err,
        })
        report.failed.push({ index: gIndex, profileId })
        return
      }

      try {
        await importProfileSettings(data, profileId, importedAt)
        console.info({
          event: 'BULK_PROFILESETTINGS',
          message: `${gIndex}: Completed to migrate profile settings for profile ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_PROFILESETTINGS',
          status: 'success',
          index: gIndex,
          profileId,
        })
        report.success.push({ index: gIndex, profileId })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate profile settings for profile ${profileId}`
        console.error({
          event: 'BULK_PROFILESETTINGS',
          message,
          profileId,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_PROFILESETTINGS',
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
      concurrency: 1,
    }
  )

  console.info({
    event: 'BULK_PROFILESETTINGS',
    message: `Completed to migrate ${profileIds.length} profile settings from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSingleProfileSettings = async (profileId) => {
  const importedAt = moment.utc().toDate()
  console.log({
    event: 'SINGLE_PROFILESETTINGS',
    message: `Starting to migrate profile settings for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })

  const data = await migrateApi.profileSettings.loadSingle(profileId)

  await importProfileSettings(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_PROFILESETTINGS',
    message: `Completed to migrate profile settings for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })
}

/**
 * Migrate all the profile settings from api
 */
export const migrateBulkProfileSettings = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_PROFILESETTINGS',
      message: 'Starting to bulk-migrate partial profile settings',
    })
    const result = await migratePartialProfileSettings(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_PROFILESETTINGS',
      message: `Completed to bulk-migrate partial ${result.migrated} profile settings`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_PROFILESETTINGS',
      message: 'Starting to migrate all profile settings',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialProfileSettings(offset, limit)
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
      event: 'BULK_PROFILESETTINGS',
      message: `Completed migration for all ${offset} profile settings`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_PROFILESETTINGS',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    duration,
    totalSuccess,
    totalFailed,
  })
}
