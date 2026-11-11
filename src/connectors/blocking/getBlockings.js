import { blockingCache } from './cache'

export default async function getBlockings(profileId) {
  const cached = await blockingCache.hasCached(profileId)
  if (cached) {
    const blockedProfileIds = await blockingCache.getAll(profileId)
    return blockedProfileIds
  }

  return blockingCache.cacheAll(profileId)
}
