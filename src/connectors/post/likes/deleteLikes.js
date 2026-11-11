import models from 'Models'

export async function deletePostLikes(profileId, shouldHardDelete = false) {
  const whereOptions = { likedBy: profileId }
  if (shouldHardDelete) {
    await models.PostLike.deleteMany(whereOptions)
  } else {
    await models.PostLike.delete(whereOptions).exec()
  }
}
