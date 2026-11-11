import models from 'Models'

/**
 * Returns Follower Profile ids from db
 */
export async function getFollowerProfileIds(profileId) {
  const followers = await models.Follower.find({ profileId }).select({
    followerProfileId: 1,
  })
  const followerProfileIds = followers.map((f) => f.followerProfileId)
  return followerProfileIds
}
