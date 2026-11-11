import models from 'Models'

export async function deleteSponsoredPosts(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = { postedBy: profileId }
  if (shouldHardDelete) {
    await models.SponsoredPost.deleteMany(whereOptions)
  } else {
    await models.SponsoredPost.delete(whereOptions).exec()
  }
}
