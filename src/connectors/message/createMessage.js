import { UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { MessageStatus, MessageType } from 'Models/message/enums'
import { escapeHtml } from 'Utils/string'

export default async function createMessage({
  activeProfileId,
  conversationId,
  text,
  attachmentsIds = [],
  webScraped = null,
  type = MessageType.TEXT,
}) {
  const conversation = await models.Conversation.findById(conversationId)
  if (!conversation || conversation.hidden) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_CONVERSATION_ID)
  }
  const myParticipant = conversation.participants.find(
    (p) => p.participant === activeProfileId
  )

  const messageAcceptableStatuses = [
    ConversationParticipantStatus.APPROVED,
    ConversationParticipantStatus.ARCHIVED,
  ]
  if (!messageAcceptableStatuses.includes(myParticipant.status)) {
    throw new UserInputError(ERRORS_BY_CODE.MESSAGE_PENDING_APPROVAL)
  }

  let recipients = []

  if (conversation.isBroadcast) {
    if (activeProfileId === conversation.initiator) {
      recipients = conversation.participants
        .filter((p) => p.participant !== activeProfileId)
        .map((p) => ({
          recipient: p.participant,
        }))
    } else {
      recipients = conversation.participants
        .filter((p) => p.participant === conversation.initiator)
        .map((p) => ({
          recipient: p.participant,
        }))
    }
  } else {
    recipients = conversation.participants
      .filter((p) => p.participant !== activeProfileId)
      .map((p) => ({
        recipient: p.participant,
      }))
  }
  const newMessage = await models.Message.create({
    conversation: conversationId,
    text: escapeHtml(text),
    sender: activeProfileId,
    recipients,
    // default pending status for all recipients
    isBroadcastMessage:
      conversation.isBroadcast && conversation.initiator === activeProfileId,
    status: MessageStatus.PENDING,
    attachments: attachmentsIds,
    type,
    webScraped,
  })
  return newMessage
}
