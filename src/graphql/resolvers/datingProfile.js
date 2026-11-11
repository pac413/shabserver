import {
  requestDatingProfile,
  emailDatingProfile,
  downloadDatingProfile,
  acceptDatingProfileRequest,
} from 'Connectors/datingProfile'
import { getPublicReferences, getReferences } from 'Connectors/reference'
import models from 'Models'
import { SiteRoles } from 'Models/profile/enums'
import { isPrivateAllowed } from 'Utils/auth'

export default {
  Query: {},
  Mutation: {
    updateDatingProfile: async (_, { input }, context) => {
      const { id, ...payload } = input
      const datingProfile = await models.DatingProfile.findOneAndUpdate(
        { _id: id },
        payload,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
      return { datingProfile }
    },

    requestDatingProfile: async (_, { input }, context) => {
      return await requestDatingProfile(input, context)
    },

    emailDatingProfile: async (_, { input }, context) => {
      return await emailDatingProfile(input, context)
    },

    downloadDatingProfile: async (_, { input }, context) => {
      return await downloadDatingProfile(input, context)
    },

    acceptDatingProfileRequest: async (_, { input }, context) => {
      return await acceptDatingProfileRequest(input, context)
    },
  },
  DatingProfile: {
    id: (parent) => parent.id || parent._id,
    completeness: async (parent) => {
      let score = Object.keys(parent).reduce((total, field) => {
        if (parent[field] && total < 7) {
          return total + 1
        }
        return total
      }, 0)
      if (
        (parent.aboutMe && parent.aboutMe.length > 20) ||
        (parent.lookingFor && parent.lookingFor.length > 20)
      ) {
        score = score + 3
      }
      return score
    },
    endorsements: async (parent) => {
      const endorsements = await models.Endorsement.find({
        profile: parent.profile,
        onSiteRole: SiteRoles.DATING,
      })
        .sort({ createdAt: -1 })
        .lean()
      return endorsements
    },
    datingEndorsements: async (parent) => {
      const [endorsements, total] = await Promise.all([
        models.Endorsement.find({
          profile: parent.profile,
          onSiteRole: SiteRoles.DATING,
        })
          .sort({ createdAt: -1 })
          .limit(2)
          .lean(),
        models.Endorsement.countDocuments({
          profile: parent.profile,
          onSiteRole: SiteRoles.DATING,
        }),
      ])
      return { endorsements, total }
    },
    references: async (parent, { input }, context) => {
      const { offset, limit } = input || {}
      if (isPrivateAllowed(parent.profile, context)) {
        const references = await getReferences(
          parent.profile,
          SiteRoles.DATING,
          { offset, limit }
        )
        return references
      }

      const references = await getPublicReferences(
        parent.profile,
        SiteRoles.DATING,
        { offset, limit }
      )
      return references
    },
  },
}
