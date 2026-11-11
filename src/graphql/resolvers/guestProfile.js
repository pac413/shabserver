import { updateGuestProfile } from 'Connectors/guestProfile'
import { getPublicReferences, getReferences } from 'Connectors/reference'
import models from 'Models'
import { SiteRoles } from 'Models/profile/enums'
import { isPrivateAllowed } from 'Utils/auth'

export default {
  Query: {},
  Mutation: {
    updateGuestProfile: async (_, { input }, context) => {
      const guestProfile = await updateGuestProfile(input, context)
      return { guestProfile }
    },
  },
  GuestProfile: {
    id: (parent) => parent.id || parent._id,
    endorsements: async (parent) => {
      const endorsements = await models.Endorsement.find({
        profile: parent.profile,
        onSiteRole: SiteRoles.GUEST,
      })
        .sort({ createdAt: -1 })
        .lean()
      return endorsements
    },
    guestEndorsements: async (parent) => {
      const [endorsements, total] = await Promise.all([
        models.Endorsement.find({
          profile: parent.profile,
          onSiteRole: SiteRoles.GUEST,
        })
          .sort({ createdAt: -1 })
          .limit(2)
          .lean(),
        models.Endorsement.countDocuments({
          profile: parent.profile,
          onSiteRole: SiteRoles.GUEST,
        }),
      ])
      return { endorsements, total }
    },
    references: async (parent, { input }, context) => {
      const { offset, limit } = input || {}
      if (isPrivateAllowed(parent.profile, context)) {
        const references = await getReferences(
          parent.profile,
          SiteRoles.GUEST,
          { offset, limit }
        )
        return references
      }

      const references = await getPublicReferences(
        parent.profile,
        SiteRoles.GUEST,
        { offset, limit }
      )
      return references
    },
  },
}
