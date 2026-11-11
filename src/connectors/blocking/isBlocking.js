import models from 'Models'
import { blockingCache } from './cache'

export default async function isBlocking(profileId, otherProfileId) {
  if (profileId === otherProfileId) {
    return false
  }

  const cached = await blockingCache.hasCached(profileId)
  if (cached) {
    return blockingCache.isOneExisting(profileId, otherProfileId)
  }

  const blocking = await models.Blocking.findOne({
    profileId,
    blockedProfileId: otherProfileId,
  })

  return !!blocking
}
