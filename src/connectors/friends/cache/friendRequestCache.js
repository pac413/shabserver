import { getFriendshipProfileIdsByStatus } from 'Connectors/friends'
import { FriendshipStatus } from 'Models/friendship/enums'
import { initializeCacheService } from 'Services/cache'

const cacheService = initializeCacheService({
  EMPTY_VALUE: 'no-friend-request',
  cacheKey: (profileId) => `profile:${profileId}:friend-request`,
})

const refreshCache = async (activeProfileId) => {
  const friendProfileIds = await getFriendshipProfileIdsByStatus(
    activeProfileId,
    FriendshipStatus.Pending
  )

  await cacheService.cacheMany(activeProfileId, friendProfileIds)
  return friendProfileIds
}

const cacheAll = async (profileId) => {
  const cached = await cacheService.hasCached(profileId)

  if (cached) {
    return cacheService.getAll(profileId)
  }

  return refreshCache(profileId)
}

const cacheOne = async (activeProfileId, friendProfileId) => {
  const cached = await cacheService.cacheOne(activeProfileId, friendProfileId)

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
