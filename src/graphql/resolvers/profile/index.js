import { isBlocking } from 'Connectors/blocking'
import { getDatingProfile } from 'Connectors/datingProfile'
import followingCache from 'Connectors/follower/cache/followingCache'
import {
  getHostProfile,
  getGuestProfile,
  getAvatarMedia,
  getWallpaperMedia,
  getFlags,
  getProfileMetrics,
} from 'Connectors/profile'
import { getProfileSettings } from 'Connectors/profileSettings'
import { upcomingHostingDates } from 'Connectors/hostingDate'
import { getPublicReferences, getReferences } from 'Connectors/reference'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { isPrivateAllowed } from 'Utils/auth'
import { Roles } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'
import Query from './query'
import Mutation from './mutation'
import Subscription from './subscription'

const simpleProfileResolver = {
  id: (parent) => parent.id || parent._id,
  avatar: async (parent) => getAvatarMedia(parent),
  profileUrl: async (parent) => getProfileUrl(parent),
  isBlocking: async (parent, _, { activeProfileId }) => {
    const id = parent.id || parent._id
    return isBlocking(activeProfileId, id)
  },
  isBlocked: async (parent, _, { activeProfileId }) => {
    const id = parent.id || parent._id
    return isBlocking(id, activeProfileId)
  },
  isFollowing: async (parent, _, { activeProfileId }) => {
    const id = parent.id || parent._id
    return followingCache.isOneExisting(activeProfileId, id)
  },
  email: async (parent, _, context) => {
    const id = parent.id || parent._id
    if (isPrivateAllowed(id, context)) {
      return parent.email
    }
    return undefined
  },
  phone: async (parent, _, context) => {
    const id = parent.id || parent._id
    if (isPrivateAllowed(id, context)) {
      return parent.phone
    }
    return null
  },
  primaryLocation: (parent, _, context) => {
    if (!parent.location) {
      return null
    }

    const id = parent.id || parent._id
    if (isPrivateAllowed(id, context)) {
      return parent.location
    }

    const { city, country, state } = parent.location
    return { city, country, state }
  },
  friendship: async (parent, _, { activeProfileId }) => {
    const id = parent.id || parent._id
    // would be great to have some in-memory caching
    const friendship = await models.Friendship.findOne({
      members: { $all: [activeProfileId, id] },
    })
    if (friendship) {
      // do not show friendship if it's hidden (except to owner)
      if (friendship.hidden && friendship.requester !== activeProfileId) {
        return null
      }
      return {
        status: friendship.currentStatus,
        id: friendship._id,
        requester: friendship.requester,
      }
    }

    return null
  },
}

export default {
  Query,
  Mutation,
  Subscription,
  SimpleProfile: simpleProfileResolver,
  Profile: {
    ...simpleProfileResolver,
    wallpaper: async (parent) => getWallpaperMedia(parent),
    hostProfile: async (parent, _, { hostingDate, activeProfileId }) => {
      const id = parent.id || parent._id
      const myself = id === activeProfileId
      let upcomingHostingDate = hostingDate
      if (!upcomingHostingDate) {
        const [hostingDate] = await upcomingHostingDates(1)
        if (hostingDate) {
          const { date } = hostingDate
          upcomingHostingDate = date
        }
      }
      return await getHostProfile(parent, upcomingHostingDate, myself)
    },
    guestProfile: async (parent) => getGuestProfile(parent),
    datingProfile: async (parent) => getDatingProfile(parent),
    pictures: async (parent, _, { activeProfileId }) => {
      const id = parent.id || parent._id
      return models.Media.find({
        ownerId: id,
        mediaType: MediaType.PICTURE,
        mediaSubType: MediaSubType.PROFILE,
        // if picture is hidden
        // show it only to owner
        // eg: show it if not hidden, or otherwise, show only to owner
        $or: [{ hidden: { $ne: true } }, { ownerId: activeProfileId }],
      }).sort({ updatedAt: -1 })
    },
    organization: (parent) => parent.organization,

    references: async (parent, { input }, context) => {
      const id = parent.id || parent._id
      const { offset, limit, siteRole } = input || {}
      if (isPrivateAllowed(id, context)) {
        const references = await getReferences(id, siteRole || null, {
          offset,
          limit,
        })
        return references
      }

      const references = await getPublicReferences(id, siteRole || null, {
        offset,
        limit,
      })
      return references
    },

    flags: (parent, _, { activeProfileId }) => {
      const id = parent.id || parent._id
      if (id !== activeProfileId) {
        return null
      }
      return getFlags(parent)
    },

    totals: async (parent) => {
      const metrics = await getProfileMetrics(parent)
      return metrics
    },

    restrictions: async (parent, _, { role }) => {
      if (role !== Roles.Admin) {
        // only admin can access this data
        return null
      }
      return {
        profileId: parent.id || parent._id,
        ...parent.restrictions,
      }
    },

    riskAssessment: async (parent, _, { role }) => {
      if (role !== Roles.Admin) {
        // only admin can access this data
        return null
      }
      return parent.riskAssessment
    },

    isPushSupported: async (parent) => {
      return !!parent.onesignalId
    },

    isAdmin: async (parent, _, { role }) => {
      if (role !== Roles.Admin) {
        // only admin can access this data
        return null
      }

      const profileId = parent.id || parent._id
      const profile = await models.Profile.findById(profileId)
      if (profile) {
        const user = await models.User.findById(profile.user)
        return user && user.isAdmin
      }

      return null
    },

    reportId: async (parent, _, { role }) => {
      if (role !== Roles.Admin) {
        // only admin can access this data
        return null
      }
      const profileId = parent.id || parent._id
      const report = await models.Report.findOne({
        reportedUser: profileId,
      })
      return report && report._id
    },

    loginMethods: async (parent, _, { role }) => {
      if (role !== Roles.Admin) {
        // only admin can access this data
        return null
      }

      const profileId = parent.id || parent._id
      const profile = await models.Profile.findById(profileId)
      if (profile) {
        const user = await models.User.findById(profile.user)
        if (user) {
          const loginMethods = []
          if (user.google && user.google.id) {
            loginMethods.push('google')
          }
          if (user.facebook && user.facebook.id) {
            loginMethods.push('facebook')
          }
          if (user.apple && user.apple.id) {
            loginMethods.push('apple')
          }
          if (user.emailToken) {
            loginMethods.push('email')
          }

          return loginMethods
        }
      }

      return null
    },

    profileSettings: async (parent, _, { activeProfileId, role }) => {
      const profileId = parent.id || parent._id
      if (role !== Roles.Admin && profileId !== activeProfileId) {
        return null
      }
      const profileSettings = await getProfileSettings(profileId)

      return profileSettings
    },
  },
}
