import models from 'Models'
import { initializeCacheService } from 'Services/cache'

const cacheService = initializeCacheService({
  EMPTY_VALUE: 'no-blocked',
  cacheKey: (profileId) => `profile:${profileId}:blocked`,
})

const refreshCache = async (profileId) => {
  const blockings = await models.Blocking.find({ blockedProfileId: profileId })
    .select({ profileId: 1 })
    .lean()

  const blockedProfileIds = blockings.map((f) => f.profileId)

  await cacheService.cacheMany(profileId, blockedProfileIds)
  return blockedProfileIds
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
    await refreshCache(profileId)
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
