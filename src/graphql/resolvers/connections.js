import { getAllConnections } from 'Connectors/connections'

export default {
  Query: {
    getAllConnections: async (_, { targetProfileId }, { activeProfileId }) => {
      return await getAllConnections({
        profileId: targetProfileId || activeProfileId,
        activeProfileId,
      })
    },
  },
}
