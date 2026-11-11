import models from 'Models'
import { initializeCacheService } from 'Services/cache'

const cacheService = initializeCacheService({
  EMPTY_VALUE: 'no-blocking',
  cacheKey: (profileId) => `profile:${profileId}:blocking`,
})

const refreshCache = async (profileId) => {
  const blockings = await models.Blocking.find({ profileId })
    .select({ blockedProfileId: 1 })
    .lean()

  const blockingProfileIds = blockings.map((f) => f.blockedProfileId)

  await cacheService.cacheMany(profileId, blockingProfileIds)
  return blockingProfileIds
}

const cacheAll = async (profileId) => {
  const cached = await cacheService.hasCached(profileId)

  if (cached) {
    return cacheService.getAll(profileId)
  }

  return refreshCache(profileId)
}

const cacheOne = async (profileId, otherProfileId) => {
  const cached = await cacheService.cacheOne(profileId, otherProfileId)

  if (!cached) {
    await refreshCache(otherProfileId)
  }
}

export default {
  cacheAll,
  cacheOne,
  clearAll: cacheService.clearAll.bind(null),
  clearOne: cacheService.clearOne.bind(null),
  getAll: cacheService.getAll.bind(null),
  getCount: cacheService.getCount.bind(null),
  hasCached: cacheService.hasCached.bind(null),
  isOneExisting: cacheService.isOneExisting.bind(null),
}
