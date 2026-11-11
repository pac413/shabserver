import { initializeCacheService } from 'Services/cache'
import { getFollowerProfileIds } from 'Connectors/follower/getFollowerProfileIds'

const cacheService = initializeCacheService({
  EMPTY_VALUE: 'no-follower',
  cacheKey: (profileId) => `profile:${profileId}:follower`,
})

const refreshCache = async (activeProfileId) => {
  const followerProfileIds = await getFollowerProfileIds(activeProfileId)

  await cacheService.cacheMany(activeProfileId, followerProfileIds)
  return followerProfileIds
}

const cacheAll = async (profileId) => {
  const cached = await cacheService.hasCached(profileId)

  if (cached) {
    return cacheService.getAll(profileId)
  }

  return refreshCache(profileId)
}

const cacheOne = async (activeProfileId, followerProfileId) => {
  const cached = await cacheService.cacheOne(activeProfileId, followerProfileId)

  if (!cached) {
    await refreshCache(activeProfileId)
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
