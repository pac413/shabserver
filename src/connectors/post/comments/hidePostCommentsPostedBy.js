import models from 'Models'

export async function hidePostCommentsPostedBy(profileId) {
  await models.PostComment.updateMany(
    { commentedBy: profileId },
    {
      hidden: true,
      isHiddenOrFlagged: true,
    }
  )
}
