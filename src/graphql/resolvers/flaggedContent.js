import * as Sentry from '@sentry/node'
import {
  getFlaggedContents,
  getFlaggedContentsByProfile,
  flagContent,
  unflagContent,
} from 'Connectors/flaggedContent'
import models from 'Models'

export default {
  Query: {
    flaggedContents: async (_, { input }, context) => {
      return await getFlaggedContents(input, context)
    },
    flaggedContentsByProfile: async (_, { input }, context) => {
      return await getFlaggedContentsByProfile(input, context)
    },
  },
  Mutation: {
    flagContent: async (_, { input }, context) => {
      return await flagContent(input, context)
    },
    unflagContent: async (_, { input }, context) => {
      return await unflagContent(input, context)
    },
  },
  FlaggedContent: {
    id: (parent) => parent.id || parent._id,
    reportedBy: async (parent, _, context) => {
      const profile = await models.Profile.findById(parent.reportedBy)
      if (!profile) {
        console.error('INVALID_FLAGGED_CONTENT_REPORTED_BY', {
          parent,
          context,
        })
        Sentry.captureException(
          new Error('INVALID_FLAGGED_CONTENT_REPORTED_BY', { parent, context })
        )
      }
      return profile
    },
    ownedBy: async (parent, _, context) => {
      if (!parent.ownedBy) {
        return null
      }
      const profile = await models.Profile.findById(parent.ownedBy)
      if (!profile) {
        console.error('INVALID_FLAGGED_CONTENT_OWNED_BY', {
          parent,
          context,
        })
        Sentry.captureException(
          new Error('INVALID_FLAGGED_CONTENT_OWNED_BY', { parent, context })
        )
      }
      return profile
    },
  },
}
