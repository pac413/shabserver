import blockedCache from './blockedCache'
import blockingCache from './blockingCache'

const cacheBlocking = async (profileId, blockedProfileId) => {
  const cached = await blockingCache.hasCached(profileId)
  if (cached) {
    await blockingCache.cacheOne(profileId, blockedProfileId)
  } else {
    await blockingCache.cacheAll(profileId)
  }
}

const cacheBlocked = async (profileId, blockingProfileId) => {
  const cached = await blockedCache.hasCached(profileId)
  if (cached) {
    await blockedCache.cacheOne(profileId, blockingProfileId)
  } else {
    await blockedCache.cacheAll(profileId)
  }
}

export default async function cacheNew(profileId, blockedProfileId) {
  await Promise.all([
    cacheBlocking(profileId, blockedProfileId),
    cacheBlocked(blockedProfileId, profileId),
  ])
}
