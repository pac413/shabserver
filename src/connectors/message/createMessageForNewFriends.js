import models from 'Models'
import { MessageStatus, MessageType } from 'Models/message/enums'

export default async function createMessageForNewFriends(conversation) {
  const newMessage = await models.Message.create({
    conversation: conversation.id,
    text: 'messages.new-friends',
    sender: conversation.participants[0].participant,
    recipients: conversation.participants.map((p) => ({
      recipient: p.participant,
    })),
    isBroadcastMessage: false,
    // default pending status for all recipients
    status: MessageStatus.SENT,
    type: MessageType.NEW_FRIENDS,
    attachments: [],
  })
  return newMessage
}
