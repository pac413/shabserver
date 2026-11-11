import { muteConnection, unmuteConnection } from 'Connectors/mutedConnection'

export default {
  Query: {},

  Mutation: {
    muteConnection: async (_, { input }, context) => {
      return await muteConnection(input, context)
    },
    unmuteConnection: async (parent, { input }, context) => {
      return await unmuteConnection(input, context)
    },
  },
}
