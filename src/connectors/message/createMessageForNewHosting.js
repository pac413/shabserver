import models from 'Models'
import { MessageStatus, MessageType } from 'Models/message/enums'

export default async function createMessageForNewHosting({
  conversation,
  sender,
}) {
  const newMessage = await models.Message.create({
    conversation: conversation.id,
    text: 'messages.new-hosting',
    sender,
    recipients: conversation.participants.map((p) => ({
      recipient: p.participant,
    })),
    isBroadcastMessage: false,
    // default pending status for all recipients
    status: MessageStatus.SENT,
    type: MessageType.NEW_HOSTING,
    attachments: [],
  })
  return newMessage
}
