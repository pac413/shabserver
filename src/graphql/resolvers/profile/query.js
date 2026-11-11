import { isActionBlocked } from 'Connectors/blocking'
import { getProfileSettings } from 'Connectors/profileSettings'
import { viewProfile } from 'Connectors/profileView'
import models from 'Models'
import { HostingStatus } from 'Models/hosting/enums'
import { SiteRoles, ProfileStatuses } from 'Models/profile/enums'

export default {
  profile: async (_, { input }, { browser, activeProfileId }) => {
    let profile

    if (input && input.handle) {
      const handle = input.handle
      profile = await models.Profile.findOne({
        handle,
        accountStatus: ProfileStatuses.ACTIVE,
      }).lean()
    } else {
      const id = input && input.id ? input.id : activeProfileId
      profile = await models.Profile.findById(id).lean()
    }

    if (!profile) {
      return {
        errors: [new Error('Profile Not Found')],
      }
    }

    if (profile._id === activeProfileId) {
      return { profile }
    }

    const actionBlocked = await isActionBlocked(activeProfileId, profile._id)
    if (actionBlocked) {
      throw new Error(
        `This Shabbat.com member's profile is not available at this time.`
      )
    }

    const activeProfileSettings = await getProfileSettings(activeProfileId)

    await viewProfile(
      activeProfileId,
      profile._id,
      browser,
      activeProfileSettings.anonymousBrowsing
    )

    return { profile }
  },

  // TODO: Check if all the profile information is required and remove unnecessary fields for Security reason
  popularHosts: async (_, { input: { limit = 5 } }) => {
    const profiles = await models.Profile.find({
      siteRoles: SiteRoles.HOST,
    })
      .sort({ dateActive: 'descending' })
      .limit(limit)
      .lean()

    return { profiles }
  },

  recentGuests: async (
    _,
    { input: { profileId, limit = 5 } },
    { activeProfileId }
  ) => {
    const filter =
      activeProfileId === profileId
        ? {
            host: profileId,
            status: HostingStatus.ACCEPTED,
          }
        : {
            host: profileId,
            guest: { $ne: activeProfileId },
            status: HostingStatus.ACCEPTED,
          }
    const hostings = await models.Hosting.find(filter)
      .limit(limit)
      .sort({ date: -1 })
      // this replaces the uuid that's stored in the 'guest' field with an actual instance of the guest
      .populate('guest')

    return {
      profiles: [
        // The Set removes duplicates
        // With Promise map we transform the array of hostings and only return the guest
        ...new Set(hostings.map((hosting) => hosting.guest)),
      ],
    }
  },

  recentHosts: async (
    _,
    { input: { profileId, limit = 5 } },
    { activeProfileId }
  ) => {
    const filter =
      activeProfileId === profileId
        ? {
            guest: profileId,
            status: HostingStatus.ACCEPTED,
          }
        : {
            guest: profileId,
            host: { $ne: activeProfileId },
            status: HostingStatus.ACCEPTED,
          }
    const hostings = await models.Hosting.find(filter)
      .limit(limit)
      .sort({ date: -1 })
      // this replaces the uuid that's stored in the 'host' field with an actual instance of the host
      .populate('host')

    return {
      profiles: [
        // The Set removes duplicates
        // With Promise map we transform the array of hostings and only return the hosts
        ...new Set(hostings.map((hosting) => hosting.host)),
      ],
    }
  },

  suggestedProfiles: async (
    _,
    { input: { siteRole, criteria, limit = 20 } },
    { activeProfileId }
  ) => {
    const filter = { siteRoles: siteRole }

    if (criteria === 'OCCUPATION') {
      const activeProfile = await models.Profile.findById(activeProfileId)
        .select({ occupation: 1 })
        .lean()
      filter.occupation = activeProfile.occupation
    }

    const profiles = await models.Profile.find(filter).limit(10)
    //  const { coordinates } = activeProfile.location.geoLocation
    // const profiles = await models.Profile.aggregate([
    //   {
    //     $geoNear: {
    //       near: { type: 'Point', coordinates },
    //       // maxDistance: 40000,
    //       distanceField: 'calcDistance',
    //       query: {
    //         siteRoles: siteRole,
    //         dateActive: { $gt: moment.utc().subtract('month', 6).toDate() },
    //       },
    //     },
    //   },
    //   { $limit: limit },
    // ])
    return {
      profiles: [...new Set(profiles)],
    }
  },

  recentMembers: async (parent, { input }) => {
    const maxLimit = 9
    const profiles = await models.Profile.find({
      accountStatus: ProfileStatuses.ACTIVE,
    })
      .sort({ createdAt: -1 })
      .skip(0)
      .limit(Math.max(Math.min(input.limit, maxLimit), 1))
    return { profiles }
  },
}
