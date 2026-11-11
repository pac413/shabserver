import moment from 'moment'
import models from 'Models'

export default async function updateSponsoredPost(postPayload) {
  const { _id: postId, content } = postPayload
  if (!postId) {
    throw new Error(`Sponsored post ${postId} cannot be found and updated`)
  }

  const originalSponsoredPost = await models.SponsoredPost.findOne({
    _id: postId,
  })
  if (!originalSponsoredPost) {
    throw new Error(`No sponsored post related with _id: ${postId}`)
  }

  // TODO: Only allow admin to update posts

  originalSponsoredPost.content = content
  originalSponsoredPost.contentUpdatedAt = moment.utc().toDate()
  await originalSponsoredPost.save()

  return models.SponsoredPost.findOne({ _id: originalSponsoredPost._id })
}
