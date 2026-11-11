import moment from 'moment'
import { createMessageForNewFriends } from 'Connectors/message'
import { eventManager } from 'Events'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { FriendshipStatus } from 'Models/friendship/enums'
import { validateParticipants } from './helper'

const addNewFriendMessage = async (conversation) => {
  const newMessage = await createMessageForNewFriends(conversation)
  conversation.participants = conversation.participants.map((p) => {
    if (newMessage.recipients.find((r) => r.recipient === p.participant)) {
      p.unreadMessages.push(newMessage._id)
    }
    return p
  })
}

/**
 * If users became friends together, we create a new conversation between them automatically
 * And send them default message that let them know that they can start conversations together
 */
export default async function createConversationForFriends(
  friendship,
  context
) {
  const { currentStatus, members } = friendship
  const { activeProfileId } = context

  // Double-check if members are friend already
  if (currentStatus !== FriendshipStatus.Friends) {
    return null
  }

  const isValid = await validateParticipants(members)
  if (!isValid) {
    return
  }

  // Check if there is conversation between members of a new friendship
  const existingConversation = await models.Conversation.findOne({
    'participants.participant': {
      $all: members,
    },
  })

  if (existingConversation) {
    const isConversationApprovedByAll = existingConversation.participants.every(
      (p) => p.status === ConversationParticipantStatus.APPROVED
    )

    // If there is a conversation between members of a new friendship, don't do anything
    if (isConversationApprovedByAll) {
      return existingConversation
    }

    // Change conversation status into approved and add start message as friends
    existingConversation.participants.forEach(
      (p) => (p.status = ConversationParticipantStatus.APPROVED)
    )
    existingConversation.lastActive = moment.utc().toDate()
    await addNewFriendMessage(existingConversation)

    eventManager.emit(
      eventManager.events.CONVERSATION_UPDATED,
      existingConversation
    )
    await existingConversation.save()
    return existingConversation
  }

  // If there was no conversations between members of a new friendship, create a new one with friend message
  const newConversation = await models.Conversation.create({
    initiator: activeProfileId,
    isBroadcast: false,
    participants: members.map((member) => ({
      participant: member,
      status: ConversationParticipantStatus.APPROVED,
    })),
    lastActive: moment.utc().toDate(),
  })
  await addNewFriendMessage(newConversation)
  eventManager.emit(eventManager.events.CONVERSATION_CREATED, newConversation)
  await newConversation.save()
  return newConversation
}
