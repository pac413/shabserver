import { difference } from 'lodash'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import followingCache from './cache/followingCache'
import { getFollowingProfileIds } from './getFollowingProfileIds'

export async function getAllFollowingProfileIds({
  profileId,
  activeProfileId,
}) {
  const cached = await followingCache.hasCached(profileId)
  let followingProfileIds
  if (cached) {
    followingProfileIds = await followingCache.getAll(profileId)
  } else {
    followingProfileIds = await getFollowingProfileIds(profileId)
  }
  followingProfileIds = followingProfileIds.filter((id) => id !== profileId)

  if (profileId === activeProfileId) {
    return followingProfileIds
  }

  const blockingProfileIds = await getActionBlockingProfileIds(activeProfileId)
  return difference(followingProfileIds, blockingProfileIds)
}
