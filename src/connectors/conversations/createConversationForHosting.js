import moment from 'moment'
import {
  createMessage,
  createMessageForNewHosting,
  sendMessage,
} from 'Connectors/message'
import { eventManager } from 'Events'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { validateParticipants } from './helper'

const addNewHostingMessage = async (conversation, { note }, context) => {
  const message = await createMessage({
    activeProfileId: context.activeProfileId,
    conversationId: conversation._id,
    text: note,
  })
  const sentMessage = await sendMessage(message, context)
  return sentMessage
}

/**
 * If users became friends together, we create a new conversation between them automatically
 * And send them default message that let them know that they can start conversations together
 */
export default async function createConversationForHosting(
  { hosting, note, isSendingNewHostingMessage },
  context
) {
  const { host, guest } = hosting

  const isValid = await validateParticipants([host, guest])
  if (!isValid) {
    return null
  }

  // Check if there is conversation between members of a new friendship
  const existingConversation = await models.Conversation.findOne({
    'participants.participant': {
      $all: [host, guest],
    },
  })

  if (existingConversation) {
    const isConversationApprovedByAll = existingConversation.participants.every(
      (p) => p.status === ConversationParticipantStatus.APPROVED
    )

    // If there is a conversation between members of a new friendship, don't do anything
    if (!isConversationApprovedByAll) {
      existingConversation.participants.forEach(
        (p) => (p.status = ConversationParticipantStatus.APPROVED)
      )
      existingConversation.lastActive = moment.utc().toDate()
      await existingConversation.save()
    }

    if (isSendingNewHostingMessage) {
      await createMessageForNewHosting({
        conversation: existingConversation,
        sender: context.activeProfileId,
      })
    }
    // Change conversation status into approved and add start message as friends
    await addNewHostingMessage(existingConversation, { note }, context)

    eventManager.emit(
      eventManager.events.CONVERSATION_UPDATED,
      existingConversation
    )

    return existingConversation
  }

  // If there was no conversations between members of a new friendship, create a new one with friend message
  const newConversation = await models.Conversation.create({
    initiator: context.activeProfileId,
    isBroadcast: false,
    participants: [
      {
        participant: host,
        status: ConversationParticipantStatus.APPROVED,
      },
      {
        participant: guest,
        status: ConversationParticipantStatus.APPROVED,
      },
    ],
    lastActive: moment.utc().toDate(),
  })
  if (isSendingNewHostingMessage) {
    await createMessageForNewHosting({
      conversation: newConversation,
      sender: context.activeProfileId,
    })
  }
  await addNewHostingMessage(newConversation, { note }, context)

  eventManager.emit(eventManager.events.CONVERSATION_CREATED, newConversation)

  await newConversation.save()
  return newConversation
}
