import { initializeCacheService } from 'Services/cache'
import { getFollowingProfileIds } from 'Connectors/follower/getFollowingProfileIds'

const cacheService = initializeCacheService({
  EMPTY_VALUE: 'no-following',
  cacheKey: (profileId) => `profile:${profileId}:following`,
})

const refreshCache = async (activeProfileId) => {
  const followingProfileIds = await getFollowingProfileIds(activeProfileId)

  await cacheService.cacheMany(activeProfileId, followingProfileIds)
  return followingProfileIds
}

const cacheAll = async (profileId) => {
  const cached = await cacheService.hasCached(profileId)

  if (cached) {
    return cacheService.getAll(profileId)
  }

  return refreshCache(profileId)
}

const cacheOne = async (activeProfileId, followingProfileId) => {
  const cached = await cacheService.cacheOne(
    activeProfileId,
    followingProfileId
  )

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
