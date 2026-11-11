import { withFilter } from 'graphql-subscriptions'
import pubsub, { PUBLISH } from 'Subscriptions'

export default {
  subscribeToSimpleProfiles: {
    resolve: ({ profile }) => profile,
    subscribe: withFilter(
      (args) => pubsub.asyncIterator([PUBLISH.PROFILE]),
      (parent, { input }) => {
        if (!parent.profile) {
          return false
        }
        const { profileIds } = input
        return profileIds && profileIds.includes(parent.profile._id)
      }
    ),
  },
  subscribeToProfile: {
    resolve: ({ profile }) => profile,
    subscribe: withFilter(
      (args) => pubsub.asyncIterator([PUBLISH.PROFILE]),
      (parent, { input }) => {
        if (!parent.profile) {
          return false
        }
        return input.profileId === parent.profile._id
      }
    ),
  },
}
