import Promise from 'bluebird'
import moment from 'moment'
import { importReferences } from 'Import/common/references/importReferences'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { migrateApi } from 'Services/migrateApi'

const DEFAULT_LIMIT = 100

/**
 * Migrate partial references indicated by `offset` and `limit` from api
 */
const migratePartialReferences = async (offset, limit) => {
  const importedAt = moment.utc().toDate()
  const report = {
    success: [],
    failed: [],
  }
  console.info({
    event: 'BULK_REFERENCES',
    message: `Starting to migrate ${limit} references from ${offset} at ${importedAt}`,
    offset,
    limit,
    importedAt,
  })

  const profiles = await models.Profile.find()
    .sort({ createdAt: 1 })
    .skip(offset)
    .limit(limit)
    .select({ _id: 1, siteRoles: 1 })
    .lean()
  const profileIds = profiles.map(({ _id }) => _id)
  console.info({
    event: 'BULK_REFERENCES',
    message: `Loaded ${profileIds.length} references from database`,
    profileIds,
  })

  await Promise.map(
    profiles,
    async (profile, index) => {
      const gIndex = offset + index
      console.info({
        event: 'BULK_REFERENCES',
        message: `${gIndex}: Starting to migrate references for profile ${profile._id}`,
        profile,
        gIndex,
      })
      let data
      try {
        data = await migrateApi.references.loadSingle(profile._id)
        console.info({
          event: 'API_REFERENCES',
          message: `${gIndex}: Loaded references ${profile._id} from production api`,
        })
      } catch (err) {
        const msg = `${gIndex}: Failed to load references ${profile._id}`
        console.error({
          event: 'API_REFERENCES',
          message: msg,
          profile,
          gIndex,
          err,
        })
        logger.alert({
          event: 'REPORT_REFERENCES',
          status: 'failed',
          index: gIndex,
          profile,
          err,
        })
        report.failed.push({ index: gIndex, profileId: profile._id })
        return
      }

      try {
        await importReferences(data, profile, importedAt)
        console.info({
          event: 'BULK_REFERENCES',
          message: `${gIndex}: Completed to migrate references for profile ${profile._id}`,
          profile,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_REFERENCES',
          status: 'success',
          index: gIndex,
          profile,
        })
        report.success.push({ index: gIndex, profileId: profile._id })
      } catch (err) {
        const message = `${gIndex}: Failed to migrate references for profile ${profile._id}`
        console.error({
          event: 'BULK_REFERENCES',
          message,
          profile,
          err,
          gIndex,
        })
        logger.alert({
          event: 'REPORT_REFERENCES',
          status: 'failed',
          index: gIndex,
          data,
          profile,
          err,
        })
        report.failed.push({ index: gIndex, profileId: profile._id })
      }
    },
    {
      concurrency: 10,
    }
  )

  console.info({
    event: 'BULK_REFERENCES',
    message: `Completed to migrate ${profileIds.length} references from ${offset} at ${importedAt}: ${report.success.length} succeeded, ${report.failed.length} failed`,
    profileIds,
  })

  return {
    migrated: profileIds.length,
    report,
  }
}

export const migrateSingleReferences = async (profileId) => {
  const importedAt = moment.utc().toDate()
  console.log({
    event: 'SINGLE_REFERENCES',
    message: `Starting to migrate references for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })

  const data = await migrateApi.references.loadSingle(profileId)
  await importReferences(data, profileId, importedAt)
  console.log({
    event: 'SINGLE_REFERENCES',
    message: `Completed to migrate references for profile ${profileId} at ${importedAt}`,
    profileId,
    importedAt,
  })
}

/**
 * Migrate all the references from api
 */
export const migrateBulkReferences = async (pOffset, pLimit) => {
  const startTime = new Date()
  const report = {
    totalSuccess: 0,
    totalFailed: 0,
  }

  if (pLimit) {
    console.log({
      event: 'BULK_REFERENCES',
      message: 'Starting to bulk-migrate partial references',
    })
    const result = await migratePartialReferences(pOffset || 0, pLimit)
    console.log({
      event: 'BULK_REFERENCES',
      message: `Completed to bulk-migrate partial ${result.migrated} references`,
    })
    report.totalSuccess += result.report.success.length
    report.totalFailed += result.report.failed.length
  } else {
    let offset = pOffset || 0
    let countLoaded

    console.log({
      event: 'BULK_REFERENCES',
      message: 'Starting to migrate all references',
    })
    while (1) {
      const limit = pLimit ? Math.min(pLimit, DEFAULT_LIMIT) : DEFAULT_LIMIT
      const result = await migratePartialReferences(offset, limit)
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
      event: 'BULK_REFERENCES',
      message: `Completed migration for all ${offset} references`,
    })
  }

  const { totalSuccess, totalFailed } = report
  const duration = new Date().getTime() - startTime.getTime()
  logger.alert({
    event: 'REPORT_REFERENCES',
    message: `RESULT - OFFSET: ${pOffset}, LIMIT: ${pLimit}`,
    offset: pOffset,
    limit: pLimit,
    duration,
    totalSuccess,
    totalFailed,
  })
}
