import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import moment from 'moment'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import { getFeatureFlagsByProfileId } from 'Connectors/featureFlag'
import friendCache from 'Connectors/friends/cache/friendCache'
import { getProfileSettings } from 'Connectors/profileSettings'
import { getProfileDataLoaders } from 'DataLoaders'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { FriendshipStatus } from 'Models/friendship/enums'
import { MessagingPrivacyTiers } from 'Models/profileSettings/enums'
import { Roles } from 'Utils/globals'
import { prepareAndSendMessageRequest } from './email'
import { getIdsByHandles, validateParticipants } from './helper'

const sendMessageRequestsIfPending = async (activeProfileId, conversation) => {
  const requests = []
  conversation.participants.forEach(async (p) => {
    if (p.status !== ConversationParticipantStatus.PENDING) return

    const { messagingPrivacy } = await getProfileSettings(p.participant)
    if (messagingPrivacy === MessagingPrivacyTiers.CONNECTIONS_ONLY) return

    const existingRequest = await models.Friendship.findOne({
      currentStatus: FriendshipStatus.Pending,
      requester: activeProfileId,
      members: { $all: [activeProfileId, p.participant] },
    })
    if (existingRequest) return

    requests.push(
      prepareAndSendMessageRequest(p.participant, activeProfileId, conversation)
    )
  })

  return Promise.all(requests)
}

const createNewConversation = async (
  { activeProfileId, role },
  { participantIds, title }
) => {
  const dataLoaders = getProfileDataLoaders(activeProfileId)
  const participantsArray = await Promise.all(
    participantIds.map(async (participantId) => {
      const [
        isMyFriend,
        isMyHost,
        isMyGuest,
        { messagingPrivacy },
        existingApprovedConversation,
      ] = await Promise.all([
        friendCache.isOneExisting(activeProfileId, participantId),
        dataLoaders.isMyHost.load(participantId),
        dataLoaders.isMyGuest.load(participantId),
        getProfileSettings(participantId),
        models.Conversation.findOne({
          participants: {
            $elemMatch: {
              $or: [
                {
                  participant: participantId,
                  status: ConversationParticipantStatus.APPROVED,
                },
                { participant: activeProfileId },
              ],
            },
          },
        }),
      ])
      /**
       * When do we mark the new broadcast conversation as approved for the participant?
       * - When the participant is a friend of the initiator
       * - When the participant is host/guest of the shabbat
       * - When the participant's profile settings is to accept all the message request from site members
       * - When there is any existing conversation that the participant already accepted before
       */
      return {
        participant: participantId,
        status:
          role === Roles.Admin ||
          isMyFriend ||
          isMyGuest ||
          isMyHost ||
          messagingPrivacy === MessagingPrivacyTiers.SITE_MEMBERS ||
          !!existingApprovedConversation
            ? ConversationParticipantStatus.APPROVED
            : ConversationParticipantStatus.PENDING,
      }
    })
  )

  const conversation = await models.Conversation.create({
    participants: [
      ...participantsArray,
      {
        participant: activeProfileId,
        status: ConversationParticipantStatus.APPROVED,
      },
    ],
    title,
    initiator: activeProfileId,
    isBroadcast: true,
    lastActive: moment.utc().toDate(),
  })

  await sendMessageRequestsIfPending(activeProfileId, conversation)

  return conversation
}

export default async function createBroadcastConversation(input, context) {
  const { broadcastMessaingEnabled } = getFeatureFlagsByProfileId(context)
  if (!broadcastMessaingEnabled) {
    throw new ForbiddenError(
      ERRORS_BY_CODE.FORBIDDEN_CREATE_BROADCAST_CONVERSATION
    )
  }

  const { participantHandles, title } = input
  const { activeProfileId } = context
  if (participantHandles.length === 0) {
    throw new UserInputError(ERRORS_BY_CODE.EMPTY_PARTICIPANTS_LIST, {
      participantHandles,
    })
  }

  // check if `participants` is array of handles
  const [allParticipantIds, forbiddenProfileIds] = await Promise.all([
    getIdsByHandles(participantHandles),
    getActionBlockingProfileIds(activeProfileId),
  ])
  const participantIds = allParticipantIds.filter(
    (profileId) => !forbiddenProfileIds.includes(profileId)
  )
  if (participantIds.length === 0) {
    throw new UserInputError(ERRORS_BY_CODE.BLOCKED_PARTICIPANTS_LIST, {
      participantHandles,
    })
  }

  const isValid = await validateParticipants([
    ...participantIds,
    activeProfileId,
  ])
  if (!isValid) {
    throw new UserInputError(ERRORS_BY_CODE.RESTRICTED_PARTICIPANTS_LIST)
  }

  const conversation = await createNewConversation(context, {
    participantIds,
    title,
  })

  eventManager.emit(eventManager.events.CONVERSATION_CREATED, conversation)
  return conversation
}
