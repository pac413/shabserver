import { FriendshipStatus } from 'Models/friendship/enums'
import { removeFriendRequest } from './utils'

export default async function removeFriend(input, context) {
  const { requestId } = input
  await removeFriendRequest({
    requestId,
    currentStatus: FriendshipStatus.Friends,
  })

  return true
}
