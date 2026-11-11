import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'

export default async function getMessages(input, { activeProfileId }) {
  const { conversationId, limit, offset } = input

  const conversation = await models.Conversation.findById(conversationId)
  if (!conversation) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_CONVERSATION_ID, {
      conversationId,
    })
  }
  const myParticipant = conversation.participants.find(
    (p) => p.participant === activeProfileId
  )
  if (!myParticipant) {
    throw new ForbiddenError(ERRORS_BY_CODE.MESSAGE_FORBIDDEN_CONVERSATION_ID)
  }

  if (myParticipant.status === ConversationParticipantStatus.PENDING) {
    return { total: 0, messages: [] }
  }

  let match
  if (conversation.isBroadcast && conversation.initiator !== activeProfileId) {
    match = {
      conversation: conversationId,
      sender: { $in: [conversation.initiator, activeProfileId] },
      'senderDeleted.deleted': { $ne: true },
      // if message is hidden
      // show it only to owner
      // eg: show it if not hidden, or otherwise, show only to owner
      $or: [{ hidden: { $ne: true } }, { sender: activeProfileId }],
    }
  } else {
    match = {
      conversation: conversationId,
      'senderDeleted.deleted': { $ne: true },
      // if message is hidden
      // show it only to owner
      // eg: show it if not hidden, or otherwise, show only to owner
      $or: [{ hidden: { $ne: true } }, { sender: activeProfileId }],
    }
  }
  const total = await models.Message.countDocuments(match)

  if (total === 0) {
    return { total: 0, messages: [] }
  }
  const messages = await models.Message.find(match)
    .sort({ dateSent: -1 })
    .skip(offset)
    .limit(limit)

  return { total, messages: messages.reverse() }
}
