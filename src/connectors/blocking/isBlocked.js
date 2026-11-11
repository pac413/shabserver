import models from 'Models'
import { blockedCache } from './cache'

export default async function isBlocked(profileId, otherProfileId) {
  if (profileId === otherProfileId) {
    return false
  }

  const cached = await blockedCache.hasCached(profileId)
  if (cached) {
    return blockedCache.isOneExisting(profileId, otherProfileId)
  }

  const blocking = await models.Blocking.findOne({
    profileId: otherProfileId,
    blockedProfileId: profileId,
  })

  return !!blocking
}
