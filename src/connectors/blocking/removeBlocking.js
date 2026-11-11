import models from 'Models'
import { blockedCache, blockingCache } from './cache'

export default async function removeBlocking(profileId, blockedProfileId) {
  const existing = await models.Blocking.findOne({
    profileId,
    blockedProfileId,
  })
  if (!existing) {
    return true
  }

  await existing.remove()
  await Promise.all([
    blockedCache.clearOne(blockedProfileId, profileId),
    blockingCache.clearOne(profileId, blockedProfileId),
  ])

  return true
}
