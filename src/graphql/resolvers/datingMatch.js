import { createDatingMatch } from 'Connectors/datingMatch'

export default {
  Query: {},
  Mutation: {
    createDatingMatch: async (_, { input }, context) => {
      const datingMatch = await createDatingMatch(input, context)
      return datingMatch
    },
  },
  DatingMatch: {
    id: (parent) => parent.id || parent._id,
  },
}
