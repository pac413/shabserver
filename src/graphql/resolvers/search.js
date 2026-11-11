import { search } from 'Connectors/search'

export default {
  Query: {
    search: async (parent, { input }, { activeProfileId }) => {
      return await search(input, activeProfileId)
    },
  },
}
