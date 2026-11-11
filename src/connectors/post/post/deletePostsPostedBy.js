import models from 'Models'

export async function deletePostsPostedBy(profileId, shouldHardDelete = false) {
  const whereOptions = { postedBy: profileId }
  if (shouldHardDelete) {
    await models.Post.deleteMany(whereOptions)
  } else {
    await models.Post.delete(whereOptions).exec()
  }
}
