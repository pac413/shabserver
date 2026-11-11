import Promise from 'bluebird'
import moment from 'moment'
import { importProfile } from 'Import/common/profile/importProfile'
import { importLogger as logger } from 'Logger/importLogger'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial profiles list indicated by `offset` and `limit` from api
 */
const migratePartialProfiles = async (offset, limit) => {
  const before = process.env.BEFORE
  const after = process.env.AFTER

  const importedAt = moment.utc(before).toDate()
  const report = {
    success: [],
    failed: [],
    skipped: [],
  }
  console.info({
    event: 'BULK_PROFILES',
    message: `Starting to migrate ${limit} profiles from ${offset} at ${importedAt}`,
    offset,
    limit,
    before,
    after,
    importedAt,
  })

  let profiles
  try {
    profiles = await migrateApi.profile.loadBulk(offset, limit, {
      before,
      after,
    })
    console.info({
      event: 'API_PROFILES',
      message: `Loaded profiles from production api`,
      offset,
      limit,
    })
  } catch (err) {
    const msg = `[PROFILE] Failed to load ${limit} profiles from ${offset}`
    console.error({
      event: 'API_PROFILES',
      message: msg,
      limit,
      offset,
      err,
    })

    for (let i = 0; i < limit; i++) {
      logger.alert({
        event: 'REPORT_PROFILES',
        status: 'failed',
        index: offset + i,
        offset,
        limit,
      })
      report.failed.push({ index: offset + i, offset, limit })
    }
    return {
      migrated: 0,
      report,
    }
  }

  await Promise.map(
    profiles,
    async (data, index) => {
      const gIndex = index + offset
      if (!data._id) {
        const message = `${gIndex}: Skipped to migrate PROFILE because it is marked as invalid`
        console.info({
          event: 'BULK_PROFILES',
          message,
          profileId: data._id,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_PROFILES',
          status: 'skipped',
          index: gIndex,
          data,
        })
        report.skipped.push({ index: gIndex })
        return
      }

      try {
        const profileId = await importProfile(data, importedAt)
        console.info({
          event: 'BULK_PROFILES',
          message: `${gIndex}: Completed to migrate PROFILE ${profileId}`,
          profileId,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_PROFILES',
          status: 'success',
          index: gIndex,
          profileId: data._id,
        })
        report.success.push({ index: gIndex, profileId: data._id })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate profiles for profile ${data._id}`
        console.error({
          event: 'BULK_PROFILES',
          message,
          profileId: data._id,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_PROFILES',
          status: 'failed',
          index: gIndex,
          data,
          profileId: data._id,
          err,
        })
        report.failed.push({ index: gIndex, profileId: data._id })
      }
    },
    {
      concurrency: 1,
    }
  )

  console.info({
    event: 'BULK_PROFILES',
    message: `Completed to migrate ${profiles.length} profiles from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed, ${report.skipped.length} skipped`,
  })

  return {
    migrated: profiles.length,
    report,
  }
}

export const migrateSingleProfile = async (profileId) => {
  const importedAt = moment.utc().toDate()
  console.log({
    event: 'SINGLE_PROFILE',
    message: `Starting to migrate profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })

  let data
  try {
    data = await migrateApi.profile.loadSingle(profileId)
    console.info({
      event: 'API_SINGLE_PROFILE',
      message: `Loaded profile ${profileId} from production api`,
      profileId,
      importedAt,
    })
  } catch (err) {
    console.info({
      event: 'API_SINGLE_PROFILE',
      message: `Failed to load profile ${profileId}`,
      profileId,
      err,
      importedAt,
    })
    return
  }

  if (!data._id) {
    console.info({
      event: 'SINGLE_PROFILE',
      message: `Skipped to migrate PROFILE ${profileId} because it is marked as invalid`,
      profileId,
      data,
      importedAt,
    })
  } else {
    try {
      console.info({
        event: 'SINGLE_PROFILE',
        message: `Starting to migrate PROFILE ${data._id}`,
        profileId: data._id,
        importedAt,
      })
      const profileId = await importProfile(data, importedAt)
      console.info({
        event: 'SINGLE_PROFILE',
        message: `Completed to migrate PROFILE ${profileId}`,
        profileId,
        importedAt,
      })
    } catch (err) {
      console.error({
        event: 'SINGLE_PROFILE',
        message: `Failed to migrate PROFILE ${data._id}`,
        profileId: data._id,
        data,
        err,
        importedAt,
      })
    }
    console.info({
      event: 'SINGLE_PROFILE',
      message: `Completed to migrate profile ${profileId} at ${importedAt}`,
      profileId,
      importedAt,
    })
  }
}

/**
 * Migrate all the profiles from api
 */
export const migrateBulkProfiles = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
    totalSkipped: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_PROFILES',
      message: 'Starting to bulk-migrate partial set of profiles',
    })
    const result = await migratePartialProfiles(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_PROFILES',
      message: `Completed to bulk-migrate partial set of ${result.migrated} profiles`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
    report.totalSkipped += result.report.skipped.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_PROFILES',
      message: 'Starting to migrate all profiles',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialProfiles(offset, limit)
      countLoaded = result.migrated
      report.totalSuccess += result.report.success.length
      report.totalFailed += result.report.failed.length
      report.totalSkipped += result.report.skipped.length
      if (countLoaded === 0 || (pLimit && pLimit <= limit)) {
        break
      }
      offset += limit
      if (pLimit) {
        pLimit -= limit
      }
    }
    console.log({
      event: 'BULK_PROFILES',
      message: `Completed to bulk-migrate all ${offset} profiles`,
    })
  }

  const { totalSuccess, totalFailed, totalSkipped } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_PROFILES',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
    totalSkipped,
  })
}
