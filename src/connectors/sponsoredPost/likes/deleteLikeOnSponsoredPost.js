import models from 'Models'

export default async function deleteLikeOnSponsoredPost(likePayload, context) {
  const { activeProfileId } = context
  const { likeId, postId } = likePayload

  const post = await models.SponsoredPost.findOne({ _id: postId })

  if (!post) {
    throw new Error(`No sponsored post with ${postId} not existing`)
  }

  const idx = post.likes.findIndex((like) => like.likedBy === activeProfileId)
  if (idx < 0) {
    throw new Error(
      `No like with ${likeId} for sponsored post ${postId} not existing`
    )
  }

  post.likes.splice(idx, 1)

  await post.save()
  return { likeId, postId }
}
