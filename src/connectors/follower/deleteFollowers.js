import models from 'Models'

export async function deleteFollowers(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ profileId: profileId }, { followerProfileId: profileId }],
  }
  if (shouldHardDelete) {
    await models.Follower.deleteMany(whereOptions)
  } else {
    await models.Follower.delete(whereOptions).exec()
  }
}
