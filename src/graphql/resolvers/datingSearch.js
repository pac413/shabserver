import { datingSearch } from 'connectors/datingSearch'

export default {
  Query: {
    datingSearch: async (parent, { input }, context) => {
      return await datingSearch(input, context)
    },
  },
}
