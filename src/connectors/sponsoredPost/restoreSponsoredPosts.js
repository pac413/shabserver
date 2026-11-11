import models from 'Models'

export async function restoreSponsoredPosts(profileId) {
  const whereOptions = { postedBy: profileId }
  await models.SponsoredPost.restore(whereOptions).exec()
}
