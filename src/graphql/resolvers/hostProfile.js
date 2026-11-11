import { ForbiddenError } from 'apollo-server-express'
import { combineResolvers, skip } from 'graphql-resolvers'
import moment from 'moment'
import {
  regeneratePrivateInviteCode,
  updateHostProfile,
  verifyPrivateInviteCode,
  getStatus,
} from 'Connectors/hostProfile'
import { getPublicReferences, getReferences } from 'Connectors/reference'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { HostProfileType } from 'Models/hostProfile/enums'
import { SiteRoles } from 'Models/profile/enums'
import { isPrivateAllowed } from 'Utils/auth'
import { Roles } from 'Utils/globals'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'

export const canTouchHostProfile = (parent, { input }, context) => {
  const { profileId } = input
  const { activeProfileId, role } = context
  if (profileId && profileId !== activeProfileId && role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.PROFILE_UPDATE_FORBIDDEN, {
      profileId,
    })
  }
  return skip
}

export default {
  Query: {
    myHostProfile: async (
      _,
      { input: { hostingDate } },
      { activeProfileId }
    ) => {
      if (!hostingDate) {
        const defaultHostProfile = await models.HostProfile.findOne({
          profile: activeProfileId,
          type: HostProfileType.DEFAULT,
        })
        return { hostProfile: defaultHostProfile }
      }
      const dateSpecificHostingProfile = await models.HostProfile.findOne({
        profile: activeProfileId,
        type: HostProfileType.DATE_SPECIFIC,
        activeDates: [moment(hostingDate).toISOString()],
      })
      return { hostProfile: dateSpecificHostingProfile }
    },
  },
  Mutation: {
    updateHostProfile: combineResolvers(
      canTouchHostProfile,
      async (_, { input }, context) => {
        const hostProfile = await updateHostProfile(input, context)
        return { hostProfile }
      }
    ),
    regeneratePrivateInviteCode: combineResolvers(
      canTouchHostProfile,
      async (_, { input }, context) => {
        const { errors, privateInviteCode } = await regeneratePrivateInviteCode(
          input,
          context
        )
        return { errors, privateInviteCode }
      }
    ),
    verifyPrivateInviteCode: async (_, { input }, context) => {
      const { errors, isValid } = await verifyPrivateInviteCode(input, context)
      return { errors, isValid }
    },
  },
  HostProfile: {
    id: (parent) => parent.id || parent._id,
    status: async (parent, _, { activeProfileId }) => {
      return parent.profile === activeProfileId
        ? parent.status
        : await getStatus(parent, activeProfileId)
    },
    details: async (parent, _, { activeProfileId, role }) => {
      if (activeProfileId !== parent._id && role !== Roles.Admin) {
        return null
      }
      return parent.details
    },
    endorsements: async (parent) => {
      const endorsements = await models.Endorsement.find({
        profile: parent.profile,
        onSiteRole: SiteRoles.HOST,
      })
        .sort({ createdAt: -1 })
        .lean()
      return endorsements
    },
    hostEndorsements: async (parent) => {
      const [endorsements, total] = await Promise.all([
        models.Endorsement.find({
          profile: parent.profile,
          onSiteRole: SiteRoles.HOST,
        })
          .sort({ createdAt: -1 })
          .limit(2)
          .lean(),
        models.Endorsement.countDocuments({
          profile: parent.profile,
          onSiteRole: SiteRoles.HOST,
        }),
      ])
      return { endorsements, total }
    },
    references: async (parent, { input }, context) => {
      const { offset, limit } = input || {}
      if (isPrivateAllowed(parent.profile, context)) {
        const references = await getReferences(parent.profile, SiteRoles.HOST, {
          offset,
          limit,
        })
        return references
      }

      const references = await getPublicReferences(
        parent.profile,
        SiteRoles.HOST,
        { offset, limit }
      )
      return references
    },
    hostMen: async (parent, _, { activeProfileId, role }) => {
      if (parent.profile !== activeProfileId && role !== Roles.Admin) {
        return null
      }
      return parent.hostMen
    },
    hostWomen: async (parent, _, { activeProfileId, role }) => {
      if (parent.profile !== activeProfileId && role !== Roles.Admin) {
        return null
      }
      return parent.hostWomen
    },
    hostFamiliesWithChildren: async (parent, _, { activeProfileId, role }) => {
      if (parent.profile !== activeProfileId && role !== Roles.Admin) {
        return null
      }
      return parent.hostFamiliesWithChildren
    },
    hostAffiliatedJews: async (parent, _, { activeProfileId, role }) => {
      if (parent.profile !== activeProfileId && role !== Roles.Admin) {
        return null
      }
      return parent.hostAffiliatedJews
    },
    hostUnAffiliatedJews: async (parent, _, { activeProfileId, role }) => {
      if (parent.profile !== activeProfileId && role !== Roles.Admin) {
        return null
      }
      return parent.hostUnAffiliatedJews
    },
    showGuestList: async (parent, _, { activeProfileId, role }) => {
      if (parent.profile !== activeProfileId && role !== Roles.Admin) {
        return null
      }
      return parent.showGuestList
    },
    unavailableGuests: (parent) => {
      return Promise.all(
        (parent.unavailableGuests || []).map((profileId) =>
          simpleProfileLoader.load(profileId)
        )
      )
    },
  },
}
