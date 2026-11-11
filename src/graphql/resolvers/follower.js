import {
  followProfile,
  unfollowProfile,
  getFollowers,
  getFollowings,
} from 'Connectors/follower'
import followingCache from 'Connectors/follower/cache/followingCache'
import models from 'Models'

export default {
  Query: {
    isFollowingProfile: async (parent, { profileId }, context) => {
      const { activeProfileId } = context
      return await followingCache.isOneExisting(activeProfileId, profileId)
    },
    followers: async (_, { input }, context) => {
      const { activeProfileId } = context
      const { profileId, offset, limit } = input
      return await getFollowers(profileId, activeProfileId, offset, limit, 'v1')
    },
    followersV2: async (_, { input }, context) => {
      const { activeProfileId } = context
      const { profileId, offset, limit } = input
      return await getFollowers(profileId, activeProfileId, offset, limit, 'v2')
    },
    followings: async (_, { input }, context) => {
      const { activeProfileId } = context
      const { profileId, offset, limit } = input
      return await getFollowings(
        profileId,
        activeProfileId,
        offset,
        limit,
        'v1'
      )
    },
    followingsV2: async (_, { input }, context) => {
      const { activeProfileId } = context
      const { profileId, offset, limit } = input
      return await getFollowings(
        profileId,
        activeProfileId,
        offset,
        limit,
        'v2'
      )
    },
  },

  Mutation: {
    followProfile: async (_, { input }, context) => {
      return await followProfile(input, context)
    },
    followProfileV2: async (_, { input }, context) => {
      const { profileId } = input
      const profile = await models.Profile.findById(profileId).lean()
      if (!profile) {
        return {
          __typename: 'Error',
          message: 'Profile not found',
        }
      }
      await followProfile(input, context)
      return {
        __typename: 'Profile',
        ...profile,
      }
    },
    unfollowProfile: async (parent, { input }, context) => {
      return await unfollowProfile(input, context)
    },
    unfollowProfileV2: async (_, { input }, context) => {
      const { profileId } = input
      const profile = await models.Profile.findById(profileId).lean()
      if (!profile) {
        return {
          __typename: 'Error',
          message: 'Profile not found',
        }
      }
      await unfollowProfile(input, context)
      return {
        __typename: 'Profile',
        ...profile,
      }
    },
  },
}
