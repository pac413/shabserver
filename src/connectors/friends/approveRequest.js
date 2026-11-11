import { UserInputError } from 'apollo-server-errors'
import { createConversationForFriends } from 'Connectors/conversations'
import { createNewNotification } from 'Connectors/notification'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { FriendshipStatus } from 'Models/friendship/enums'
import { NotificationType, NotificationStatus } from 'Models/notification/enums'
import { sendAcceptFriendRequest } from 'Services/email'
import { prepareAcceptRequestEmailTemplate } from 'Utils/email'
import { FRONTEND_URL } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'
import friendCache from './cache/friendCache'
import friendRequestCache from './cache/friendRequestCache'

export default async function approveRequest(input, context) {
  const { requestId } = input
  const { activeProfileId } = context
  const friendship = await models.Friendship.findOne({
    _id: requestId,
    currentStatus: FriendshipStatus.Pending,
    members: activeProfileId,
  })
  if (!friendship) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_FRIEND_REQUEST_ID, {
      requestId,
      currentStatus: FriendshipStatus.Pending,
    })
  }

  // update status
  friendship.currentStatus = FriendshipStatus.Friends
  friendship.statusHistory.push({
    status: FriendshipStatus.Pending,
  })
  const requesterId = friendship.members.find(
    (item) => item !== activeProfileId
  )
  await friendship.save()

  // Send request approval notification to requester
  const requester = await models.Profile.findById(requesterId).lean()
  const simpleActiveProfile = await simpleProfileLoader.load(activeProfileId)
  const template = {
    ...(await prepareAcceptRequestEmailTemplate(
      activeProfileId,
      requester._id
    )),
    messagingUrl: `${FRONTEND_URL}/messages/${simpleActiveProfile.handle}`,
  }

  await Promise.all([
    sendAcceptFriendRequest(template),
    createFriendRequestApproveNotification(friendship),
    createConversationForFriends(friendship, context),
    friendCache.cacheOne(activeProfileId, requester._id),
    friendCache.cacheOne(requester._id, activeProfileId),
    friendRequestCache.clearOne(activeProfileId, requester._id),
  ])

  return {
    status: FriendshipStatus.Friends,
    profile: requester,
  }
}

const createFriendRequestApproveNotification = async (friendship) => {
  const profile = friendship.members.find(
    (item) => item !== friendship.requester
  )
  const user = await simpleProfileLoader.load(profile)

  await createNewNotification({
    profile: friendship.requester,
    triggeredBy: profile,
    type: NotificationType.FRIEND_REQUEST_APPROVED,
    title: {
      name: 'notification.friend-request-approved.title',
      variables: {
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
    content: {
      name: 'notification.friend-request-approved.content',
      variables: {
        profileUrl: getProfileUrl(user),
        firstName: user.firstName,
        lastName: user.lastName,
      },
    },
    status: NotificationStatus.NEW,
  })
}
