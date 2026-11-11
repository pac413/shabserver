import * as Sentry from '@sentry/node'
import { withFilter } from 'graphql-subscriptions'
import {
  createBroadcastConversation,
  createConversation,
  searchConversations,
  approveConversation,
  rejectConversation,
  archiveConversation,
  getPendingConversations,
} from 'Connectors/conversations'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { eventManager } from 'Events'
import models from 'Models'
import pubsub, { PUBLISH } from 'Subscriptions'

export default {
  Query: {
    conversation: async (_, { input: { id } }) => {
      return await models.Conversation.findById(id)
    },
    conversations: async (_, { input }, context) => {
      const result = await searchConversations(input, context)
      return result
    },
    pendingConversations: async (_, { input }, context) => {
      const result = await getPendingConversations(input, context)
      return result
    },
  },
  Mutation: {
    createBroadcastConversation: async (_, { input }, context) => {
      return await createBroadcastConversation(input, context)
    },

    createConversation: async (_, { input }, context) => {
      return await createConversation(input, context)
    },

    approveConversation: async (_, { input }, context) => {
      return await approveConversation(input, context)
    },

    rejectConversation: async (_, { input }, context) => {
      return await rejectConversation(input, context)
    },

    archiveConversation: async (_, { input }, context) => {
      return await archiveConversation(input, context)
    },

    userIsTyping: async (
      _,
      { input: { conversationId, mediaType } },
      context
    ) => {
      const { activeProfileId } = context
      const conversation = await models.Conversation.findById(conversationId)
      if (!conversation) {
        return false
      }

      // If the conversation doesn't include current authenticated user as participant, doesn't publish subscriptions
      if (
        conversation.participants &&
        !conversation.participants
          .map((p) => p.participant)
          .includes(activeProfileId)
      ) {
        return false
      }

      eventManager.emit(eventManager.events.USER_IS_TYPING, {
        conversation,
        mediaType,
        profileId: activeProfileId,
      })
      return true
    },
  },

  Subscription: {
    subscribeToConversations: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PUBLISH.CONVERSATION),
        ({ subscribeToConversations: { conversation } }, args, context) => {
          const { activeProfileId } = context
          const found = conversation.participants.find((p) => {
            return p.participant === activeProfileId
          })
          return !!found
        }
      ),
    },
    subscribeToUserIsTyping: {
      subscribe: withFilter(
        () => pubsub.asyncIterator(PUBLISH.USER_IS_TYPING),
        async (
          { subscribeToUserIsTyping: { conversation, profileId } },
          args,
          context
        ) => {
          const { activeProfileId } = context
          if (profileId === activeProfileId) {
            return false
          }
          if (conversation.isBroadcast) {
            /**
             * When the conversation is broadcast one:
             * - If the typing user(profileId) is initiator, all the participants will be notified.
             * - If the typing user is not initiator, only initiator is notified.
             */
            return (
              profileId === conversation.initiator ||
              activeProfileId === conversation.initiator
            )
          }
          const found = conversation.participants
            .map((p) => p.participant)
            .includes(activeProfileId)
          return found
        }
      ),
    },
  },
  Conversation: {
    id: (parent) => parent.id || parent._id,
    isBroadcast: (parent) => !!parent.isBroadcast,
    initiator: async (parent, _, context) => {
      const initiatorId =
        parent.initiator ||
        parent.participants[parent.participants.length - 1].participant
      const initiatorProfile = await simpleProfileLoader.load(initiatorId)
      if (!initiatorProfile) {
        console.error('INVALID_CONVERSATION_PARTICIPANT', {
          conversation: parent,
          participant: initiatorId,
          context,
        })
        Sentry.captureException(
          new Error('INVALID_CONVERSATION_PARTICIPANT', {
            conversation: parent,
            participant: initiatorId,
            context,
          })
        )
        return null
      }
      return initiatorProfile
    },
    participants: async (parent, _, context) => {
      let conversationParticipants = []
      if (parent.isBroadcast) {
        /**
         * If this conversation is broadcast one and you are not the initiator,
         * you cannot see the full conversation participants list.
         * Only the initiator could see the full conversation participants list.
         */
        if (context.activeProfileId === parent.initiator) {
          conversationParticipants = parent.participants
        } else {
          conversationParticipants = parent.participants.filter((p) =>
            [context.activeProfileId, parent.initiator].includes(p.participant)
          )
        }
      } else {
        conversationParticipants = parent.participants
      }
      const participants = await Promise.all(
        conversationParticipants.map(async (p) => {
          const profile = await simpleProfileLoader.load(p.participant)
          if (!profile) {
            console.error('INVALID_CONVERSATION_PARTICIPANT', {
              parent,
              participant: p,
              context,
            })
            Sentry.captureException(
              new Error('INVALID_CONVERSATION_PARTICIPANT', {
                parent,
                participant: p,
                context,
              })
            )
            return null
          }
          return {
            profile,
            status: p.status,
          }
        })
      )
      return participants.filter((p) => !!p)
    },
    lastMessage: async (parent, _, context) => {
      const { activeProfileId } = context
      let message
      if (parent.isBroadcast) {
        /**
         * If this conversation is broadcast one and you are not the initiator,
         * you cannot see the full conversation messages list.
         * Only the initiator could see the last message.
         */
        if (activeProfileId === parent.initiator) {
          message = await models.Message.findOne({
            conversation: parent._id,
            'senderDeleted.deleted': { $ne: true },
            // if message is hidden
            // show it only to owner
            // eg: show it if not hidden, or otherwise, show only to owner
            $or: [{ hidden: { $ne: true } }, { sender: activeProfileId }],
          }).sort({ dateSent: -1 })
        } else {
          message = await models.Message.findOne({
            conversation: parent._id,
            'senderDeleted.deleted': { $ne: true },
            // if message is hidden
            // show it only to owner
            // eg: show it if not hidden, or otherwise, show only to owner
            sender: { $in: [activeProfileId, parent.initiator] },
            $or: [{ hidden: { $ne: true } }, { sender: activeProfileId }],
          }).sort({ dateSent: -1 })
        }
      } else {
        message = await models.Message.findOne({
          conversation: parent._id,
          'senderDeleted.deleted': { $ne: true },
          // if message is hidden
          // show it only to owner
          // eg: show it if not hidden, or otherwise, show only to owner
          $or: [{ hidden: { $ne: true } }, { sender: activeProfileId }],
        }).sort({ dateSent: -1 })
      }
      if (!message) {
        return null
      }
      const recipientRecord = message.recipients.find(
        (r) => r.recipient === activeProfileId
      )
      if (recipientRecord && recipientRecord.deleted) {
        return null
      }
      return message
    },
    unreadMessagesCount: (parent, _, context) => {
      const { activeProfileId } = context
      const record = parent.participants.find(
        (r) => r.participant === activeProfileId
      )
      return record.unreadMessages.length
    },
  },
}
