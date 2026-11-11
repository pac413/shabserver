import { UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { FriendshipStatus } from 'Models/friendship/enums'
import friendCache from './cache/friendCache'
import friendRequestCache from './cache/friendRequestCache'

export const DEFAULT_FRIENDS_LIMIT = 20

export async function removeFriendRequest({
  requestId,
  currentStatus,
  requester,
}) {
  const matchQuery = {
    _id: requestId,
    currentStatus,
    ...(requester ? { requester } : {}),
  }

  const friendship = await models.Friendship.findOne(matchQuery)
  if (!friendship) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_FRIEND_REQUEST_ID, {
      requestId,
      currentStatus: FriendshipStatus.Pending,
    })
  }

  const friendshipData = friendship.toObject()
  const { members } = friendshipData
  await Promise.all([
    friendCache.clearOne(members[0], members[1]),
    friendCache.clearOne(members[1], members[0]),
    friendRequestCache.clearOne(members[0], members[1]),
    friendRequestCache.clearOne(members[1], members[0]),
  ])

  await friendship.remove()

  return friendshipData
}

export async function removeFriendshipBetweenProfileIds(
  profileId1,
  profileId2
) {
  const friendship = await models.Friendship.findOne({
    members: { $all: [profileId1, profileId2] },
  })
  if (!friendship) {
    return true
  }

  const friendshipData = friendship.toObject()
  const { members } = friendshipData
  await Promise.all([
    friendCache.clearOne(members[0], members[1]),
    friendCache.clearOne(members[1], members[0]),
    friendRequestCache.clearOne(members[0], members[1]),
    friendRequestCache.clearOne(members[1], members[0]),
  ])

  await friendship.remove()

  return friendshipData
}
