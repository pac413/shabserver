import * as Sentry from '@sentry/node'
import { isActionBlocked } from 'Connectors/blocking'
import {
  endorse,
  endorseMultipleGuests,
  deleteEndorsement,
  deleteEndorsementRequestNotification,
  updateEndorsement,
  getEndorsement,
  getEndorsementsByProfileId,
} from 'Connectors/endorsement'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { EndorsableSiteRoles } from 'Models/endorsement/enums'
import { NotificationType } from 'Models/notification/enums'

export default {
  Query: {
    endorsement: async (_, { input: { id } }, { activeProfileId }) => {
      const endorsement = await getEndorsement(id)
      return { endorsement }
    },
    endorsements: async (
      _,
      { input: { onSiteRole, profileId, offset, limit } },
      context
    ) => {
      const { activeProfileId } = context

      const actionBlocked = await isActionBlocked(activeProfileId, profileId)
      if (actionBlocked) {
        console.error('FORBIDDEN_ACCESS_TO_PROFILE_ENDORSEMENTS', {
          profileId,
          context,
        })
        Sentry.captureException(
          new Error('FORBIDDEN_ACCESS_TO_PROFILE_ENDORSEMENTS', {
            profileId,
            context,
          })
        )
        return {
          edges: {
            nodes: [],
            profileId,
            offset: offset || 0,
            limit,
          },
          total: 0,
        }
      }

      const { endorsements, total } = await getEndorsementsByProfileId(
        profileId,
        onSiteRole,
        offset || 0,
        limit
      )
      return {
        edges: {
          nodes: endorsements,
          profileId,
          offset: offset || 0,
          limit,
        },
        total,
      }
    },
  },
  Mutation: {
    endorseHost: async (
      _,
      { input: { profileId, body, reference, endorsingBack } },
      context
    ) => {
      const { activeProfileId } = context
      const endorsement = await endorse(
        activeProfileId,
        EndorsableSiteRoles.HOST,
        profileId,
        body,
        endorsingBack
      )
      if (reference && reference.hostingId) {
        deleteEndorsementRequestNotification(
          {
            hostingId: reference.hostingId,
            type: NotificationType.HOST_ENDORSEMENT_REQUEST,
          },
          context
        )
      }
      return { endorsement }
    },
    endorseGuest: async (
      _,
      { input: { profileId, body, reference, endorsingBack } },
      context
    ) => {
      const { activeProfileId } = context
      const endorsement = await endorse(
        activeProfileId,
        EndorsableSiteRoles.GUEST,
        profileId,
        body,
        endorsingBack
      )
      if (reference && reference.hostingId) {
        deleteEndorsementRequestNotification(
          {
            hostingId: reference.hostingId,
            type: NotificationType.GUEST_ENDORSEMENT_REQUEST,
          },
          context
        )
      }
      return { endorsement }
    },
    endorseMultipleGuests: async (
      _,
      { input: { multipleEndorsements } },
      context
    ) => {
      const { activeProfileId } = context
      const endorsements = await endorseMultipleGuests(
        activeProfileId,
        EndorsableSiteRoles.GUEST,
        multipleEndorsements
      )
      return { endorsements }
    },
    endorseDatingProspect: async (
      _,
      { input: { profileId, body, endorsingBack } },
      { activeProfileId }
    ) => {
      const endorsement = await endorse(
        activeProfileId,
        EndorsableSiteRoles.DATING,
        profileId,
        body,
        endorsingBack
      )
      return { endorsement }
    },
    deleteEndorsement: async (_, { input }) => {
      const { id } = input
      await deleteEndorsement(id)
      return { deleted: true }
    },
    updateEndorsement: async (_, { input }) => {
      const { id } = input
      const endorsement = await updateEndorsement(id, input)
      return { endorsement }
    },
  },
  Endorsement: {
    id: (parent) => parent.id || parent._id,
    endorser: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.endorser)
      if (!profile) {
        console.error('INVALID_ENDORSER', { parent, context })
        Sentry.captureException(
          new Error('INVALID_ENDORSER', { parent, context })
        )
      }
      return profile
    },
    date: (parent) => parent.createdAt,
  },
}
