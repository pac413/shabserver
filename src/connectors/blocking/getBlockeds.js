import { blockedCache } from './cache'

export default async function getBlockeds(profileId) {
  const cached = await blockedCache.hasCached(profileId)
  if (cached) {
    const blockingProfileIds = await blockedCache.getAll(profileId)
    return blockingProfileIds
  }

  return blockedCache.cacheAll(profileId)
}
