import models from 'Models'

/**
 * Returns Follower Profile ids from db
 */
export async function getFollowingProfileIds(followerProfileId) {
  const followings = await models.Follower.find({ followerProfileId }).select({
    profileId: 1,
  })
  const followingProfileIds = followings.map((f) => f.profileId)
  return followingProfileIds
}
