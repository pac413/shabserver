import { AuthenticationError } from 'apollo-server-errors'
import {
  getAdminRecentMembers,
  getAdminTotals,
  getAdminRecentMemberData,
} from 'Connectors/admin'
import models from 'Models'
import { Roles } from 'Utils/globals'

export default {
  Query: {
    adminRecentMembers: async (parent, { input }, context) => {
      const { role } = context
      if (role !== Roles.Admin) {
        throw AuthenticationError('This is for admin only')
      }
      return await getAdminRecentMembers(input)
    },

    adminRecentMemberData: async (parent, input, context) => {
      const { role } = context
      if (role !== Roles.Admin) {
        throw AuthenticationError('This is for admin only')
      }
      return await getAdminRecentMemberData(input)
    },

    adminTotals: async (parent, _, context) => {
      const { role } = context
      if (role !== Roles.Admin) {
        // only admin can access this data
        return null
      }
      return await getAdminTotals()
    },

    adminMemberRecentMessages: async (parent, { input }, context) => {
      const { role } = context
      if (role !== Roles.Admin) {
        throw AuthenticationError('This is for admin only')
      }
      const [messages, total] = await Promise.all([
        models.Message.find({
          'senderDeleted.deleted': { $ne: true },
          sender: input.profileId,
        })
          .sort({ dateSent: -1 })
          .limit(input.limit),
        models.Message.countDocuments({ sender: input.profileId }),
      ])

      return { messages, total }
    },
  },
  Mutation: {
    adminDeleteAvatar: async (p, { input }, context) => {
      const profile = await models.Profile.findById(input.profileId)
      if (!profile) {
        return {
          __typename: 'Error',
          message: 'Profile not found',
        }
      }
      profile.avatar = null
      await profile.save()
      return {
        __typename: 'Profile',
        ...profile.toObject(),
      }
    },
  },
}
