import { difference } from 'lodash'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import followerCache from './cache/followerCache'
import { getFollowerProfileIds } from './getFollowerProfileIds'

export async function getAllFollowerProfileIds({
  profileId,
  activeProfileId,
  excludeBlockings = false,
}) {
  const cached = await followerCache.hasCached(profileId)
  let followerProfileIds
  if (cached) {
    followerProfileIds = await followerCache.getAll(profileId)
  } else {
    followerProfileIds = await getFollowerProfileIds(profileId)
  }
  followerProfileIds = followerProfileIds.filter((id) => id !== profileId)

  if (profileId === activeProfileId || !excludeBlockings) {
    return followerProfileIds
  }

  const blockingProfileIds = await getActionBlockingProfileIds(activeProfileId)
  return difference(followerProfileIds, blockingProfileIds)
}
