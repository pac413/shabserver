import { difference } from 'lodash'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import { FriendshipStatus } from 'Models/friendship/enums'
import friendRequestCache from './cache/friendRequestCache'
import { getFriendshipProfileIdsByStatus } from './getFriendshipProfileIdsByStatus'

export const getPendingFriendProfileIds = async ({
  profileId,
  activeProfileId,
}) => {
  const cached = await friendRequestCache.hasCached(profileId)
  let friendProfileIds
  if (cached) {
    friendProfileIds = await friendRequestCache.getAll(profileId)
  } else {
    friendProfileIds = await getFriendshipProfileIdsByStatus(
      profileId,
      FriendshipStatus.Pending
    )
  }
  const blockingProfileIds = await getActionBlockingProfileIds(activeProfileId)

  return difference(friendProfileIds, blockingProfileIds)
}
