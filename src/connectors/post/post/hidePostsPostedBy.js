import models from 'Models'

export async function hidePostsPostedBy(profileId) {
  await models.Post.updateMany(
    { postedBy: profileId },
    {
      hidden: true,
      isHiddenOrFlagged: true,
    }
  )
}
