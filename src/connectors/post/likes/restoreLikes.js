import models from 'Models'

export async function restorePostLikes(profileId) {
  const whereOptions = { likedBy: profileId }
  await models.PostLike.restore(whereOptions).exec()
}
