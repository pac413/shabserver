import { UserInputError } from 'apollo-server-errors'
import { isActionBlocked } from 'Connectors/blocking'
import { createNewNotification } from 'Connectors/notification'
import { getProfileSettings } from 'Connectors/profileSettings'
import { isActionsRestricted } from 'Connectors/user'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { FriendshipStatus } from 'Models/friendship/enums'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { sendFriendRequest } from 'Services/email'
import { prepareRequestEmailTemplate } from 'Utils/email'
import { Roles, FRONTEND_URL } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'
import friendCache from './cache/friendCache'
import friendRequestCache from './cache/friendRequestCache'

export default async function addFriend(input, context) {
  const { profileId } = input
  const { activeProfileId, role } = context

  const profile = await models.Profile.findById(profileId).lean()

  if (!profile || profileId === activeProfileId) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_FRIEND_PROFILE_ID)
  }

  const profileSettings = await getProfileSettings(profileId)

  // if admin sends a friend request or a user explicitly set it to auto-approve
  // skip the approval step and make friend immediately
  const skipApprovalRequest =
    role === Roles.Admin || !profileSettings.friendRequestNeeded
  const status = skipApprovalRequest
    ? FriendshipStatus.Friends
    : FriendshipStatus.Pending

  const existingRequest = await models.Friendship.findOne({
    members: { $all: [activeProfileId, profileId] },
  })
  if (
    existingRequest &&
    [FriendshipStatus.Friends, FriendshipStatus.Pending].includes(
      existingRequest.currentStatus
    )
  ) {
    throw new UserInputError(ERRORS_BY_CODE.FRIENDSHIP_ALREADY_EXISTS)
  }

  const actionBlocked = await isActionBlocked(activeProfileId, profileId)
  if (actionBlocked) {
    throw new UserInputError(ERRORS_BY_CODE.BLOCKING_FRIEND_PROFILE_ID)
  }

  const activeProfile = await models.Profile.getRestrictions(activeProfileId)
  const friendship = await models.Friendship.create({
    members: [activeProfileId, profileId],
    requester: activeProfileId,
    currentStatus: status,
    statusHistory: [{ status }],
    hidden: isActionsRestricted(activeProfile),
  })

  if (status === FriendshipStatus.Friends) {
    await Promise.all([
      friendCache.cacheOne(activeProfileId, profileId),
      friendCache.cacheOne(profileId, activeProfileId),
    ])
  } else {
    await friendRequestCache.cacheOne(profileId, activeProfileId)

    if (!friendship.hidden) {
      // Do not send notification to recipient if requester is "Action Restricted"
      // or request approval is not required
      sendFriendRequest({
        ...(await prepareRequestEmailTemplate(profileId, activeProfileId)),
        deleteActionRedirectUrl: `${FRONTEND_URL}/action/friend-request/delete/${friendship.id}`,
        confirmActionRedirectUrl: `${FRONTEND_URL}/action/friend-request/accept/${friendship.id}`,
        blockActionRedirectUrl: '',
      })

      await createNewFriendRequestNotification(friendship)
    }
  }

  return {
    id: friendship.id,
    status,
    profile,
  }
}

const createNewFriendRequestNotification = async (friendship) => {
  const requesterProfile = await simpleProfileLoader.load(friendship.requester)
  const profile = friendship.members.find(
    (item) => item !== friendship.requester
  )

  await createNewNotification({
    profile,
    triggeredBy: friendship.requester,
    type: NotificationType.FRIEND_REQUEST,
    title: { name: 'notification.new-friend-request.title' },
    content: {
      name: 'notification.new-friend-request.content',
      variables: {
        profileUrl: getProfileUrl(requesterProfile),
        firstName: requesterProfile.firstName,
        lastName: requesterProfile.lastName,
      },
    },
    status: NotificationStatus.NEW,
    referenceId: friendship._id,
    actions: [
      {
        name: 'Accept',
        label: { name: 'notification.new-friend-request.accept' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.ACCEPT_FRIEND_REQUEST,
        payload: {
          requestId: friendship.id,
          profileId: friendship.requester,
        },
        actionUrl: `/action/friend-request/accept/${friendship.id}`,
      },
      {
        name: 'Delete',
        label: { name: 'notification.new-friend-request.delete' },
        style: NotificationActionStyle.SECONDARY,
        type: NotificationActionType.DELETE_FRIEND_REQUEST,
        payload: {
          requestId: friendship.id,
          profileId: friendship.requester,
        },
        actionUrl: `/action/friend-request/delete/${friendship.id}`,
      },
    ],
  })
}
