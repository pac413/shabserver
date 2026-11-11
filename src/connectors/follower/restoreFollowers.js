import models from 'Models'

export async function restoreFollowers(profileId) {
  const whereOptions = {
    $or: [{ profileId: profileId }, { followerProfileId: profileId }],
  }
  await models.Follower.restore(whereOptions).exec()
}
