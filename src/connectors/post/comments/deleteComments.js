import models from 'Models'

export async function deletePostComments(profileId, shouldHardDelete = false) {
  const whereOptions = { commentedBy: profileId }
  if (shouldHardDelete) {
    await models.PostComment.deleteMany(whereOptions)
  } else {
    await models.PostComment.delete(whereOptions).exec()
  }
}
