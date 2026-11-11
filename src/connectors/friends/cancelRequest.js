import { FriendshipStatus } from 'Models/friendship/enums'
import { removeFriendRequest } from './utils'

export default async function cancelRequest(input, context) {
  const { requestId } = input
  const { activeProfileId } = context

  await removeFriendRequest({
    requestId,
    currentStatus: FriendshipStatus.Pending,
    requester: activeProfileId,
  })

  return true
}
