import * as Sentry from '@sentry/node'
import {
  acceptHosting,
  bulkInvitations,
  declineHosting,
  extendHosting,
  getGuestListVisibility,
  getHostingById,
  queryHostings,
  requestHosting,
} from 'Connectors/hosting'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { sendMessageToGuests } from './mutations/sendMessageToGuests'

export default {
  Query: {
    Hostings: async (_, { input }, context) => {
      const response = await queryHostings(input, context)
      return response
    },
    hostingById: async (_, { id }, context) => {
      const hosting = await getHostingById(id, context)
      return hosting
    },
    guestListVisibility: async (_, { profileId }, context) => {
      const response = await getGuestListVisibility(profileId, context)
      return response
    },
  },

  Mutation: {
    requestHosting: async (_, { input }, context) => {
      const response = await requestHosting(input, context)
      return response
    },

    extendHosting: async (_, { input }, context) => {
      const response = await extendHosting(input, context)
      return response
    },

    acceptHosting: async (_, { input }, context) => {
      const response = await acceptHosting(input, context)
      return response
    },

    declineHosting: async (_, { input }, context) => {
      const response = await declineHosting(input, context)
      return response
    },

    bulkInvitations: async (_, { input }, context) => {
      const response = await bulkInvitations(input, context)
      return response
    },

    sendMessageToGuests,
  },

  Hosting: {
    id: (parent) => parent.id || parent._id,
    host: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.host)
      if (!profile) {
        console.error('INVALID_HOSTING_HOST', { parent, context })
        Sentry.captureException(
          new Error('INVALID_HOSTING_HOST', { parent, context })
        )
      }
      return profile
    },
    guest: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.guest)
      if (!profile) {
        console.error('INVALID_HOSTING_GUEST', { parent, context })
        Sentry.captureException(
          new Error('INVALID_HOSTING_GUEST', { parent, context })
        )
      }
      return profile
    },
    notes: (parent) =>
      parent.statusHistory.map((h) => ({
        sender: parent.host === h.profile ? 'host' : 'guest',
        body: h.note,
        status: h.status,
        date: h.date,
      })),
  },
}
