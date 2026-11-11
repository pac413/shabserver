import models from 'Models'

export async function restorePostComments(profileId) {
  const whereOptions = { commentedBy: profileId }
  await models.PostComment.restore(whereOptions).exec()
}
