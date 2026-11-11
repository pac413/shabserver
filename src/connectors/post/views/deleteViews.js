import models from 'Models'

export async function deletePostViews(profileId, shouldHardDelete = false) {
  const whereOptions = { viewedBy: profileId }
  if (shouldHardDelete) {
    await models.PostView.deleteMany(whereOptions)
  } else {
    await models.PostView.delete(whereOptions).exec()
  }
}
