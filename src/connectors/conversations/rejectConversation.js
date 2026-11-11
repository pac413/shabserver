import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { dismissNotification } from 'Connectors/notification'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { updateParticipantStatus } from './helper'

export default async function rejectConversation(input, { activeProfileId }) {
  const { conversationId } = input
  const conversation = await models.Conversation.findById(conversationId)
  if (!conversation) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_CONVERSATION_ID, {
      conversationId,
    })
  }
  const participant = conversation.participants.find(
    (p) => p.participant === activeProfileId
  )
  if (!participant) {
    throw new ForbiddenError(ERRORS_BY_CODE.CONVERSATION_REJECT_FORBIDDEN)
  }
  if (participant.status !== ConversationParticipantStatus.PENDING) {
    throw new UserInputError(ERRORS_BY_CODE.CONVERSATION_REJECT_NOT_PENDING)
  }

  const hasUpdatedParticipantStatus = updateParticipantStatus(
    conversation,
    activeProfileId,
    ConversationParticipantStatus.REJECTED
  )
  if (!hasUpdatedParticipantStatus) {
    throw new ForbiddenError(ERRORS_BY_CODE.CONVERSATION_REJECT_NOT_PENDING)
  }

  await conversation.save()
  await dismissNotification({ referenceId: conversationId })

  eventManager.emit(eventManager.events.CONVERSATION_UPDATED, conversation)
  return conversation
}
