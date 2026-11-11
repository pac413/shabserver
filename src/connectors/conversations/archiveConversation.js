import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { updateParticipantStatus } from './helper'

export default async function archiveConversation(input, { activeProfileId }) {
  const { conversationId } = input
  const conversation = await models.Conversation.findById(conversationId)
  if (!conversation || conversation.hidden) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_CONVERSATION_ID, {
      conversationId,
    })
  }
  if (conversation.isBroadcast && conversation.initiator !== activeProfileId) {
    throw new ForbiddenError(
      ERRORS_BY_CODE.FORBIDDEN_ARCHIVE_BROADCAST_CONVERSATION,
      { conversationId }
    )
  }

  const hasUpdatedParticipantStatus = updateParticipantStatus(
    conversation,
    activeProfileId,
    ConversationParticipantStatus.ARCHIVED
  )
  if (!hasUpdatedParticipantStatus) {
    throw new ForbiddenError(
      'You are not authorized to archive this conversation'
    )
  }

  await conversation.save()

  eventManager.emit(eventManager.events.CONVERSATION_UPDATED, conversation)
  return { archived: conversationId }
}
