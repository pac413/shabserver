import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { dismissNotification } from 'Connectors/notification'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { prepareAndSendAcceptConversationRequest } from './email'
import { updateParticipantStatus } from './helper'

export default async function approveConversation(input, { activeProfileId }) {
  const { conversationId } = input
  const conversation = await models.Conversation.findById(conversationId)
  if (!conversation || conversation.hidden) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_CONVERSATION_ID, {
      conversationId,
    })
  }

  const hasUpdatedParticipantStatus = updateParticipantStatus(
    conversation,
    activeProfileId,
    ConversationParticipantStatus.APPROVED
  )
  if (!hasUpdatedParticipantStatus) {
    throw new ForbiddenError(ERRORS_BY_CODE.CONVERSATION_APPROVAL_FORBIDDEN)
  }

  await conversation.save()

  const requester = conversation.participants.find(
    (p) => p.participant !== activeProfileId
  )
  await prepareAndSendAcceptConversationRequest(
    activeProfileId,
    requester.participant,
    conversation
  )
  await dismissNotification({ referenceId: conversationId })

  eventManager.emit(eventManager.events.CONVERSATION_UPDATED, conversation)
  return conversation
}
