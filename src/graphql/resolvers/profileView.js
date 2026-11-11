import * as Sentry from '@sentry/node'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import models from 'Models'

export default {
  Query: {
    profileViews: async (_, { input }, { activeProfileId }) => {
      const { limit, offset, profileId } = input
      const query = {
        viewed: profileId || activeProfileId,
        anonymous: { $ne: true },
      }

      const total = await models.ProfileView.countDocuments(query)

      let profileViews = []

      if (total > 0 && total > offset) {
        profileViews = await models.ProfileView.find(query)
          .sort({ dateViewed: -1 })
          .limit(limit)
          .skip(offset)
      }
      return { profileViews, total }
    },
  },

  Mutation: {},

  ProfileView: {
    viewer: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.viewer)
      if (!profile) {
        console.error('INVALID_PROFILE_VIEWER', { parent, context })
        Sentry.captureException(
          new Error('INVALID_PROFILE_VIEWER', { parent, context })
        )
      }
      return profile
    },
    lastVisited: (parent) => parent.dateViewed,
  },
}
