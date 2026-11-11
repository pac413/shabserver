import { setPreference } from 'Connectors/preference'

export default {
  Mutation: {
    setPreference: async (_, { input }, { activeProfileId }) => {
      const profile = await setPreference(activeProfileId, input)
      return { profile }
    },
  },
}
