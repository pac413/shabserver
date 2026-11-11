import { getAvatar, getLocationString } from 'Connectors/profile'
import i18n from 'i18n'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { MessageType } from 'Models/message/enums'
import { sendNewMessageEmail } from 'Services/email'
import { THUMBNAILS, FRONTEND_URL } from 'Utils/globals'

export const sendUnreadMessagEmail = async (messageId) => {
  const message = await models.Message.findById(messageId)
  const { recipients, sender } = message
  const [conversation, senderProfile] = await Promise.all([
    models.Conversation.findById(message.conversation),
    models.Profile.findById(sender),
  ])
  if (!conversation) {
    return
  }
  recipients.forEach(async ({ recipient, read }) => {
    if (recipient === sender || read) {
      return
    }
    const participant = conversation.participants.find(
      (p) => p.participant === recipient
    )
    if (
      !participant ||
      participant.status !== ConversationParticipantStatus.APPROVED
    ) {
      return
    }
    const recipientProfile = await models.Profile.findById(recipient)

    // https://old.shabbat.com/Help/ResourceModel?modelName=MessageType
    let messageType = 0
    let body = message.text
    if (message.type === MessageType.IMAGE) {
      messageType = 1
    } else if (message.type === MessageType.VIDEO) {
      messageType = 2
    } else if (message.type === MessageType.AUDIO) {
      messageType = 3
    } else if (
      message.type === MessageType.NEW_FRIENDS ||
      message.type === MessageType.NEW_HOSTING
    ) {
      messageType = 0
      body = i18n.__({
        locale: recipientProfile.primaryLocale || 'en',
        phrase: message.text,
      })
    }

    sendNewMessageEmail({
      profileId: recipient,
      sender: {
        firstName: senderProfile.firstName,
        lastName: senderProfile.lastName,
        location: getLocationString(senderProfile, false),
        avatarUrl: await getAvatar(senderProfile, THUMBNAILS.MEDIUM),
        profileUrl: `${FRONTEND_URL}/profile/${senderProfile.handle}`,
      },
      reciever: {
        firstName: recipientProfile.firstName,
        lastName: recipientProfile.lastName,
        location: getLocationString(recipientProfile, false),
        avatarUrl: await getAvatar(recipientProfile, THUMBNAILS.MEDIUM),
        profileUrl: `${FRONTEND_URL}/profile/${recipientProfile.handle}`,
      },
      recipientEmail: recipientProfile.email,
      message: body,
      messageType,
      conversationUrl: conversation.isBroadcast
        ? `${FRONTEND_URL}/messages/broadcast/${conversation._id}`
        : `${FRONTEND_URL}/messages/${senderProfile.handle}`,
      emailPreferenceUrl: `${FRONTEND_URL}/action/messages-by-email-off/accept/${recipientProfile.id}`,
    })
  })
}
