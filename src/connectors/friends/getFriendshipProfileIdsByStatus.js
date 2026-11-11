import models from 'Models'
import { FriendshipStatus } from 'Models/friendship/enums'

/**
 * Returns the list of friend/friend-request profile ids
 *
 * @param {string} profileId Profile Id
 * @param {string} currentStatus Friendship status
 * @returns {[string]} Profile ids
 */
export const getFriendshipProfileIdsByStatus = async (
  profileId,
  currentStatus
) => {
  const friends = await models.Friendship.find(
    currentStatus === FriendshipStatus.Friends
      ? {
          currentStatus,
          members: profileId,
          hidden: {
            $ne: true,
          },
        }
      : {
          currentStatus,
          members: profileId,
          hidden: {
            $ne: true,
          },
          requester: { $nin: profileId },
        }
  )
    .select({ members: 1 })
    .lean()

  const friendProfileIds = []

  friends.forEach((friend) => {
    const member = friend.members.find((m) => m !== profileId)
    if (member) {
      friendProfileIds.push(member)
    }
  })

  return friendProfileIds
}
