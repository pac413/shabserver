import { datingAutoTypeSearch } from 'connectors/datingSearch'

export default {
  Query: {
    datingAutoTypeSearch: async (_, { input }, context) => {
      return datingAutoTypeSearch(input, context)
    },
  },
}
