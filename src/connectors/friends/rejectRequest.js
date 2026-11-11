import models from 'Models'
import { FriendshipStatus } from 'Models/friendship/enums'
import { removeFriendRequest } from './utils'

export default async function rejectRequest(input) {
  const { requestId } = input
  const friendship = await removeFriendRequest({
    requestId,
    currentStatus: FriendshipStatus.Pending,
    includeProfile: true,
  })

  const requester = await models.Profile.findById(friendship.requester)
  return { profile: requester }
}
