import models from 'Models'

export async function restorePostViews(profileId) {
  const whereOptions = { viewedBy: profileId }
  await models.PostView.restore(whereOptions).exec()
}
