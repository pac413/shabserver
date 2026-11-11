import models from 'Models'

export async function restorePostsPostedBy(profileId) {
  const whereOptions = { postedBy: profileId }
  await models.Post.restore(whereOptions).exec()
}
