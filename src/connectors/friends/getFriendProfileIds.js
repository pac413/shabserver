import { difference } from 'lodash'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import { FriendshipStatus } from 'Models/friendship/enums'
import friendCache from './cache/friendCache'
import { getFriendshipProfileIdsByStatus } from './getFriendshipProfileIdsByStatus'

export const getFriendProfileIds = async ({ profileId, activeProfileId }) => {
  const cached = await friendCache.hasCached(profileId)
  let friendProfileIds
  if (cached) {
    friendProfileIds = await friendCache.getAll(profileId)
  } else {
    friendProfileIds = await getFriendshipProfileIdsByStatus(
      profileId,
      FriendshipStatus.Friends
    )
  }

  const blockingProfileIds = await getActionBlockingProfileIds(activeProfileId)
  return difference(friendProfileIds, blockingProfileIds)
}
