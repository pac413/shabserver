import * as Sentry from '@sentry/node'
import i18n from 'i18n'
import { sendPushNotification } from 'Connectors/notification'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { NotificationType, NotificationStatus } from 'Models/notification/enums'

export default async function createMessageReaction({ input, context }) {
  const { conversationId, messageId, reaction } = input
  const { activeProfileId, locale } = context
  const conversation = await models.Conversation.findOne({
    _id: conversationId,
    'participants.participant': activeProfileId,
  })
  if (!conversation) {
    console.error('MESSAGE_REACTION_INVALID_CONVERSATION_ID', {
      input,
      context,
    })
    Sentry.captureException(
      new Error('MESSAGE_REACTION_INVALID_CONVERSATION_ID', {
        input,
        context,
      })
    )
    return {
      __typename: 'CreateMessageReactionFailure',
      code: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_CONVERSATION_ID,
      message: i18n.__({
        locale,
        phrase: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_CONVERSATION_ID,
      }),
    }
  }
  const message = await models.Message.findOne({
    _id: messageId,
    conversation: conversationId,
  })
  if (!message) {
    console.error('MESSAGE_REACTION_INVALID_MESSAGE_ID', { input, context })
    Sentry.captureException(
      new Error('MESSAGE_REACTION_INVALID_MESSAGE_ID', { input, context })
    )
    return {
      __typename: 'CreateMessageReactionFailure',
      code: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_MESSAGE_ID,
      message: i18n.__({
        locale,
        phrase: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_MESSAGE_ID,
      }),
    }
  }
  let messageReaction = await models.MessageReaction.findOne({
    messageId,
    reactedBy: activeProfileId,
  })
  if (!messageReaction) {
    messageReaction = await models.MessageReaction.create({
      reaction,
      messageId,
      reactedBy: activeProfileId,
      date: new Date(),
    })
  } else {
    messageReaction.reaction = reaction
    messageReaction.date = new Date()
    await messageReaction.save()
  }

  const sender = await models.Profile.findById(message.sender)
  const activeProfile = await models.Profile.findById(activeProfileId).lean()
  await sendPushNotification({
    data: {
      profile: sender._id,
      triggeredBy: activeProfileId,
      type: NotificationType.MESSAGE_REACTION,
      title: {
        name: 'notification.message-reaction.mobile-title',
        variables: {
          firstName: activeProfile.firstName,
          lastName: activeProfile.lastName,
        },
      },
      content: {
        name: 'notification.message-reaction.content',
        variables: {
          reaction,
        },
      },
      status: NotificationStatus.NEW,
      messageId: message.id,
      conversationId,
    },
    notification: {
      type: NotificationType.MESSAGE_REACTION,
      triggeredBy: activeProfileId,
    },
    profile: sender,
  })

  eventManager.emit(eventManager.events.MESSAGE_UPDATED, message, {
    activeProfileId,
  })

  return {
    __typename: 'MessageReaction',
    ...messageReaction.toObject(),
  }
}
