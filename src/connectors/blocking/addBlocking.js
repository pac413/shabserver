import { removeFollower } from 'Connectors/follower'
import { removeFriendshipBetweenProfileIds } from 'Connectors/friends/utils'
import models from 'Models'
import { cacheNew } from './cache'

export default async function addBlocking(profileId, blockedProfileId) {
  const existing = await models.Blocking.findOne({
    profileId,
    blockedProfileId,
  })
  if (existing) {
    return existing
  }

  const blocking = await models.Blocking.create({
    profileId,
    blockedProfileId,
  })

  // Remove followers and followings
  await removeFollower(profileId, blockedProfileId, true)
  await removeFollower(blockedProfileId, profileId, true)

  // Remove friends
  await removeFriendshipBetweenProfileIds(profileId, blockedProfileId)

  await cacheNew(profileId, blockedProfileId)
  return blocking
}
