import moment from 'moment'
import { eventManager, events } from 'Events'
import models from 'Models'

export const updateConversationLastActive = async (message) => {
  const conversation = await models.Conversation.findById(message.conversation)
  conversation.lastActive = moment.utc().toDate()
  await conversation.save()
}

export const updateConversationLastAndIncreaseUnread = async (message) => {
  const conversation = await models.Conversation.findById(message.conversation)
  conversation.participants = conversation.participants.map((p) => {
    if (message.recipients.find((r) => r.recipient === p.participant)) {
      p.unreadMessages.push(message._id)
    }
    return p
  })
  const updatedConversation = await conversation.save()
  if (!message.hidden && !updatedConversation.hidden) {
    eventManager.emit(events.CONVERSATION_UPDATED, updatedConversation)
  }
}

export const decreaseConversationUnread = async (messages, context) => {
  if (messages.length === 0) {
    return
  }

  const { activeProfileId } = context
  const conversationId = messages[0].conversation

  const conversation = await models.Conversation.findById(conversationId)
  const participantIdx = conversation.participants.findIndex(
    (p) => p.participant === activeProfileId
  )
  if (participantIdx < 0) {
    return
  }
  const participant = conversation.participants[participantIdx]
  if (participant.unreadMessages.length === 0) {
    return
  }

  const readMessageIds = messages.map((m) => m._id)
  participant.unreadMessages = participant.unreadMessages.filter(
    (m) => !readMessageIds.includes(m)
  )

  const updatedConversation = await conversation.save()
  if (!updatedConversation.hidden) {
    eventManager.emit(events.CONVERSATION_UPDATED, updatedConversation)
  }
}

export const updateConversationOnMessageDelete = async (message, context) => {
  const conversation = await models.Conversation.findById(message.conversation)
  conversation.participants = conversation.participants.map((p) => {
    const unreadMessages = p.unreadMessages.filter((m) => m !== message._id)
    const newP = {
      participant: p.participant,
      status: p.status,
    }
    if (unreadMessages.length) {
      newP.unreadMessages = unreadMessages
    }
    return newP
  })
  const updatedConversation = await conversation.save()

  if (!updatedConversation.hidden) {
    eventManager.emit(events.CONVERSATION_UPDATED, updatedConversation)
  }
}
