import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import moment from 'moment'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import friendCache from 'Connectors/friends/cache/friendCache'
import { getProfileSettings } from 'Connectors/profileSettings'
import { getProfileDataLoaders } from 'DataLoaders'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { FriendshipStatus } from 'Models/friendship/enums'
import { MessagingPrivacyTiers } from 'Models/profileSettings/enums'
import { prepareAndSendMessageRequest } from './email'
import {
  getIdsByHandles,
  updateParticipantStatus,
  validateParticipants,
} from './helper'

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

const createNewConversation = async (activeProfileId, participants) => {
  const dataLoaders = getProfileDataLoaders(activeProfileId)
  const participantsArray = await Promise.all(
    participants.map(async (participant) => {
      const [isMyFriend, isMyHost, isMyGuest, { messagingPrivacy }] =
        await Promise.all([
          friendCache.isOneExisting(activeProfileId, participant),
          dataLoaders.isMyHost.load(participant),
          dataLoaders.isMyGuest.load(participant),
          getProfileSettings(participant),
        ])

      return {
        participant,
        status:
          isMyFriend ||
          isMyGuest ||
          isMyHost ||
          messagingPrivacy === MessagingPrivacyTiers.SITE_MEMBERS
            ? ConversationParticipantStatus.APPROVED
            : ConversationParticipantStatus.PENDING,
      }
    })
  )

  const conversation = await models.Conversation.create({
    initiator: activeProfileId,
    isBroadcast: false,
    participants: [
      ...participantsArray,
      {
        participant: activeProfileId,
        status: ConversationParticipantStatus.APPROVED,
      },
    ],
    lastActive: moment.utc().toDate(),
  })

  await sendMessageRequestsIfPending(activeProfileId, conversation)

  return conversation
}

export default async function createConversation(input, { activeProfileId }) {
  const { participants } = input
  if (participants.length === 0) {
    throw new UserInputError(ERRORS_BY_CODE.EMPTY_PARTICIPANTS_LIST, {
      participants,
    })
  }

  // check if `participants` is array of handles
  let participantIds = await getIdsByHandles(participants)
  if (participantIds.length === 0) {
    participantIds = [...participants]
  }

  const forbiddenProfileIds = await getActionBlockingProfileIds(activeProfileId)
  participantIds = participantIds.filter(
    (profileId) => !forbiddenProfileIds.includes(profileId)
  )
  if (participantIds.length === 0) {
    throw new UserInputError(ERRORS_BY_CODE.BLOCKED_PARTICIPANTS_LIST, {
      participants,
    })
  }

  const isValid = await validateParticipants([
    ...participantIds,
    activeProfileId,
  ])
  if (!isValid) {
    throw new UserInputError(ERRORS_BY_CODE.RESTRICTED_PARTICIPANTS_LIST)
  }

  const existingConversation = await models.Conversation.findOne({
    'participants.participant': {
      $all: [...participantIds, activeProfileId],
    },
    isBroadcast: { $ne: true },
  })
  if (existingConversation) {
    const hasUpdatedParticipantStatus = updateParticipantStatus(
      existingConversation,
      activeProfileId,
      ConversationParticipantStatus.APPROVED
    )
    if (!hasUpdatedParticipantStatus) {
      throw new ForbiddenError(ERRORS_BY_CODE.CONVERSATION_APPROVAL_FORBIDDEN)
    }

    existingConversation.lastActive = moment.utc().toDate()
    eventManager.emit(
      eventManager.events.CONVERSATION_UPDATED,
      existingConversation
    )
    await existingConversation.save()
    return existingConversation
  }

  const conversation = await createNewConversation(
    activeProfileId,
    participantIds
  )

  eventManager.emit(eventManager.events.CONVERSATION_CREATED, conversation)
  return conversation
}
