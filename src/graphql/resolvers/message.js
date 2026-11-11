import * as Sentry from '@sentry/node'
import { withFilter } from 'graphql-subscriptions'
import i18n from 'i18n'
import {
  createMessage,
  createMessageReaction,
  deleteMessage,
  getMessages,
  getMessageStatus,
  readMessage,
  sendMessage,
} from 'Connectors/message'
import conversationLoader from 'DataLoaders/conversationLoader'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { eventManager } from 'Events'
import models from 'Models'
import { MessageType } from 'Models/message/enums'
import pubsub, { PUBLISH } from 'Subscriptions'
import { ERRORS_BY_CODE } from 'Errors'

export default {
  Query: {
    messages: async (_, { input }, { activeProfileId }) => {
      const result = await getMessages(input, { activeProfileId })
      return result
    },
  },

  Mutation: {
    createMessage: async (
      _,
      { input: { conversationId, text, attachmentsIds, type, webScraped } },
      context
    ) => {
      const { activeProfileId } = context
      const message = await createMessage({
        activeProfileId,
        conversationId,
        text: text || '',
        attachmentsIds,
        type,
        webScraped,
      })
      const sentMessage = await sendMessage(message, context)
      return { message: sentMessage }
    },

    readMessages: async (
      _,
      { input: { conversationId } },
      { activeProfileId }
    ) => {
      const messages = await models.Message.find({
        conversation: conversationId,
        recipients: {
          $elemMatch: {
            recipient: activeProfileId,
            read: { $ne: true },
          },
        },
      })
      const updatedMessages = await Promise.all(
        messages.map((m) => readMessage(activeProfileId, m))
      )
      eventManager.emit(eventManager.events.MESSAGES_READ, updatedMessages, {
        activeProfileId,
      })
      return { messages: updatedMessages }
    },

    deleteMessage: async (_, { input: { messageId } }, context) => {
      const message = await models.Message.findById(messageId)
      await deleteMessage(message, context)
      return { deleted: true }
    },

    createMessageReaction: async (_, { input }, context) => {
      const messageReaction = await createMessageReaction({
        input,
        context,
      })
      return messageReaction
    },

    deleteMessageReaction: async (_, { input }, context) => {
      const { id, messageId } = input
      const { activeProfileId, locale } = context
      const messageReaction = await models.MessageReaction.findOne({
        _id: id,
        messageId,
        reactedBy: activeProfileId,
      })

      if (!messageReaction) {
        console.error('MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID', {
          input,
          context,
        })
        Sentry.captureException(
          new Error('MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID', {
            input,
            context,
          })
        )
        return {
          __typename: 'DeleteMessageReactionFailure',
          code: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID,
          message: i18n.__({
            locale,
            phrase: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID,
          }),
        }
      }

      await messageReaction.remove()

      return {
        __typename: 'DeleteMessageReactionSuccess',
        id,
        messageId,
      }
    },

    updateMessageReaction: async (_, { input }, context) => {
      const { id, messageId, reaction } = input
      const { activeProfileId, locale } = context
      const messageReaction = await models.MessageReaction.findOne({
        _id: id,
        messageId,
        reactedBy: activeProfileId,
      })

      if (!messageReaction) {
        console.error('MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID', {
          input,
          context,
        })
        Sentry.captureException(
          new Error('MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID', {
            input,
            context,
          })
        )
        return {
          __typename: 'UpdateMessageReactionFailure',
          code: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID,
          message: i18n.__({
            locale,
            phrase: ERRORS_BY_CODE.MESSAGE_REACTION_INVALID_MESSAGE_REACTION_ID,
          }),
        }
      }

      messageReaction.reaction = reaction
      await messageReaction.save()

      return {
        __typename: 'MessageReaction',
        ...messageReaction.toObject(),
      }
    },
  },

  Subscription: {
    subscribeToMessages: {
      subscribe: withFilter(
        (args) => pubsub.asyncIterator(PUBLISH.MESSAGE),
        async ({ subscribeToMessages: { message } }, { input }, context) => {
          const { conversationId } = input
          const { activeProfileId } = context
          const conversation = await conversationLoader.load(conversationId)
          if (!conversation) {
            return false
          }
          if (conversation.isBroadcast) {
            return (
              conversationId === message.conversation &&
              (conversation.initiator === activeProfileId ||
                message.sender === activeProfileId)
            )
          }
          // Only return messages in subscribed to conversation
          const isParticipant = conversation.participants
            .map((p) => p.participant)
            .includes(activeProfileId)
          return conversationId === message.conversation && isParticipant
        }
      ),
    },
  },
  Message: {
    id: (parent) => parent.id || parent._id,
    sender: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.sender)
      if (!profile) {
        console.error('INVALID_MESSAGE_SENDER', { parent, context })
        Sentry.captureException(
          new Error('INVALID_MESSAGE_SENDER', { parent, context })
        )
      }
      return profile
    },
    conversation: async (parent, _, context) => {
      const conversation = await conversationLoader.load(parent.conversation)
      if (!conversation) {
        console.error('INVALID_MESSAGE_CONVERSATION_ID', {
          parent,
          context,
        })
        Sentry.captureException(
          new Error('INVALID_MESSAGE_CONVERSATION_ID', { parent, context })
        )
      }
      return conversation
    },
    status: (parent) => getMessageStatus(parent),
    text: (parent, _, { locale }) => {
      if (
        parent.type === MessageType.NEW_FRIENDS ||
        parent.type === MessageType.NEW_HOSTING
      ) {
        return i18n.__({ locale, phrase: parent.text })
      }
      return parent.text
    },
    date: (parent) => parent.dateSent,
    attachments: (parent) => {
      return models.Media.find({
        _id: {
          $in: parent.attachments,
        },
      })
    },
    reactions: (parent) => {
      return models.MessageReaction.find({
        messageId: parent.id || parent._id,
      }).sort({ date: -1 })
    },
  },
  MessageReaction: {
    id: (parent) => parent.id || parent._id,
    reactedBy: (parent) => {
      return simpleProfileLoader.load(parent.reactedBy)
    },
  },
}
