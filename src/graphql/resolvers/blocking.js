import { addBlocking, getBlockings, removeBlocking } from 'connectors/blocking'
import models from 'Models'
import { Roles } from 'Utils/globals'

export default {
  Query: {
    blockingProfiles: async (_, { profileId }, context) => {
      const blockings = await getBlockings(profileId || context.activeProfileId)
      const profiles = await models.Profile.find({
        _id: { $in: blockings },
      })

      return profiles
    },
  },
  Mutation: {
    blockProfile: async (_, { profileId }, context) => {
      if (context.activeProfileId === profileId) {
        return false
      }
      await addBlocking(context.activeProfileId, profileId)
      return true
    },
    blockProfileV2: async (_, { profileId }, context) => {
      if (context.activeProfileId === profileId) {
        return {
          __typename: 'Error',
          message: 'You cannot block yourself',
        }
      }
      const profile = await models.Profile.findById(profileId).lean()
      if (!profile) {
        return {
          __typename: 'Error',
          message: 'Profile not found',
        }
      }
      await addBlocking(context.activeProfileId, profileId)
      return {
        __typename: 'Profile',
        ...profile,
      }
    },
    unblockProfile: async (
      _,
      { profileId, onbehalf },
      { activeProfileId, role }
    ) => {
      const primaryUser =
        onbehalf && role === Roles.Admin ? onbehalf : activeProfileId
      await removeBlocking(primaryUser, profileId)
      return true
    },
    unblockProfileV2: async (
      _,
      { profileId, onbehalf },
      { activeProfileId, role }
    ) => {
      const primaryUser =
        onbehalf && role === Roles.Admin ? onbehalf : activeProfileId
      const profile = await models.Profile.findById(profileId).lean()
      if (!profile) {
        return {
          __typename: 'Error',
          message: 'Profile not found',
        }
      }
      await removeBlocking(primaryUser, profileId)
      return {
        __typename: 'Profile',
        ...profile,
      }
    },
  },
}
