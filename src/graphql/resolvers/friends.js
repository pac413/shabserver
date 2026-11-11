import {
  getFriends,
  addFriend,
  removeFriend,
  approveRequest,
  rejectRequest,
  cancelRequest,
} from 'Connectors/friends'
import { dismissNotification } from 'Connectors/notification'

export default {
  Query: {
    friends: async (parent, { input }, context) => {
      return getFriends(input, context, 'v1')
    },
    friendsV2: async (parent, { input }, context) => {
      return getFriends(input, context, 'v2')
    },
  },

  Mutation: {
    addFriend: async (_, { input }, context) => {
      return await addFriend(input, context)
    },

    removeFriend: async (_, { input }, context) => {
      return await removeFriend(input, context)
    },

    approveRequest: async (_, { input }, context) => {
      const { requestId: friendshipId } = input
      const result = await approveRequest(input, context)
      await dismissNotification({ referenceId: friendshipId })
      return result
    },

    rejectRequest: async (_, { input }) => {
      const result = await rejectRequest(input)
      await dismissNotification({ referenceId: input.requestId })
      return result
    },

    cancelRequest: async (_, { input }, context) => {
      const result = await cancelRequest(input, context)
      await dismissNotification({ referenceId: input.requestId })
      return result
    },
  },
}
