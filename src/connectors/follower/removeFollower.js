import { UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import followerCache from './cache/followerCache'
import followingCache from './cache/followingCache'

export async function removeFollower(
  profileId,
  followerProfileId,
  doNothingIfNotExist = false
) {
  const existingFollower = await models.Follower.findOne({
    profileId,
    followerProfileId,
  })

  if (!existingFollower) {
    if (doNothingIfNotExist) {
      return true
    }
    throw new UserInputError(ERRORS_BY_CODE.INVALID_FOLLOWER_ID, {
      followerProfileId,
    })
  }

  await models.Follower.deleteOne({ _id: existingFollower._id })
  await Promise.all([
    followerCache.clearOne(profileId, followerProfileId),
    followingCache.clearOne(followerProfileId, profileId),
  ])
  return true
}
