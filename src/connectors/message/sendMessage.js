import { createNewNotification } from 'Connectors/notification'
import { isMessagingRestricted } from 'Connectors/user'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { eventManager } from 'Events'
import { jobQueue } from 'Jobs/jobQueue'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { MessageStatus } from 'Models/message/enums'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'

const createNewMessageNotifications = async (message, { activeProfileId }) => {
  const sender = await simpleProfileLoader.load(message.sender)
  const conversation = await models.Conversation.findById(message.conversation)

  const promises = []

  message.recipients.forEach((r) => {
    const participant = conversation.participants.find(
      (p) => p.participant === r.recipient
    )

    // Should not send new message notification to the sender.
    if (participant.participant === message.sender) {
      return
    }
    if (participant.status !== ConversationParticipantStatus.APPROVED) {
      return
    }

    promises.push(
      createNewNotification({
        profile: r.recipient,
        triggeredBy: activeProfileId,
        type: NotificationType.NEW_MESSAGE,
        title: {
          name: 'notification.new-message.title',
          variables: {
            senderProfileUrl: `/profile/${sender.handle}`,
            senderFirstName: sender.firstName,
            senderLastName: sender.lastName,
          },
        },
        content: {
          name: message.text
            ? message.text
            : 'notification.new-message.attachment',
        },
        status: NotificationStatus.NEW,
        messageId: message.id,
        conversationId: conversation._id,
        actions: [
          {
            name: 'view',
            label: { name: 'notification.new-message.view' },
            style: NotificationActionStyle.PRIMARY,
            type: NotificationActionType.VIEW_MESSAGE,
            actionUrl: conversation.isBroadcast
              ? `/messages/broadcast/${conversation._id}?messageId=${message.id}`
              : `/messages/${sender.handle}?messageId=${message.id}`,
          },
        ],
      })
    )
  })

  return Promise.all(promises)
}

export default async function sendMessage(message, { activeProfileId }) {
  const flags = message.flagged.length
  if (flags) {
    message.$set('status', MessageStatus.BLOCKED)
    return await message.save()
  } else {
    message.$set('status', MessageStatus.SENT)
  }

  const activeProfile = await models.Profile.getRestrictions(activeProfileId)
  const messagingRestricted = isMessagingRestricted(activeProfile)
  if (messagingRestricted) {
    message.$set('hidden', true)
  }
  await message.save()

  // do not send notification if message has been marked as hidden
  if (!message.hidden) {
    eventManager.emit(eventManager.events.MESSAGE_SENT, message)
    await createNewMessageNotifications(message, { activeProfileId })
    await jobQueue.add(
      jobQueue.jobs.NewMessageSent,
      {
        messageId: message._id,
      },
      { DelaySeconds: process.env.NEW_MESSAGE_EMAIL_DELAY_SECONDS || 300 }
    )
  }
  return message
}
