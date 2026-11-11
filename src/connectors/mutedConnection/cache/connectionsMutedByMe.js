import models from 'Models'
import { initializeCacheService } from 'Services/cache'

const cacheService = initializeCacheService({
  EMPTY_VALUE: 'no-muted',
  cacheKey: (profileId) => `profile:${profileId}:mutedByMe`,
})

const refreshCache = async (profileId) => {
  const mutedProfiles = await models.MutedConnection.find({
    profileId,
  })
    .select({ mutedProfileId: 1 })
    .lean()

  const mutedProfileIds = mutedProfiles.map((item) => item.mutedProfileId)

  await cacheService.cacheMany(profileId, mutedProfileIds)
  return mutedProfileIds
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
  cacheMany: cacheService.cacheMany.bind(null),
  clearAll: cacheService.clearAll.bind(null),
  clearOne: cacheService.clearOne.bind(null),
  getAll: cacheService.getAll.bind(null),
  getCount: cacheService.getCount.bind(null),
  hasCached: cacheService.hasCached.bind(null),
  isOneExisting: cacheService.isOneExisting.bind(null),
}
