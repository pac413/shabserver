import models from 'Models'
import friendCache from 'Connectors/friends/cache/friendCache'
import followerCache from 'Connectors/follower/cache/followerCache'
import followingCache from 'Connectors/follower/cache/followingCache'

/**
 * Get the profile metrics
 * @param {*} profile
 * @returns { views, invites, connections }
 */
export const getProfileMetrics = async (profile) => {
  const profileId = profile._id
  // Calculate the profile views
  const views = await models.ProfileView.countDocuments({ viewed: profileId })
  // Calculate the total invites
  const invites = await models.Hosting.countDocuments({
    hidden: {
      $ne: true,
    },
    $or: [{ host: profileId }, { guest: profileId }],
  })
  // Calculate the total connections
  const [friendsCount, followersCount, followingsCount] = await Promise.all([
    friendCache.cacheAll(profileId).then(() => friendCache.getCount(profileId)),
    followerCache
      .cacheAll(profileId)
      .then(() => followerCache.getCount(profileId)),
    followingCache
      .cacheAll(profileId)
      .then(() => followingCache.getCount(profileId)),
  ])

  return {
    views,
    invites,
    connections:
      Math.max(friendsCount, 0) +
      Math.max(followersCount, 0) +
      Math.max(followingsCount, 0),
  }
}
