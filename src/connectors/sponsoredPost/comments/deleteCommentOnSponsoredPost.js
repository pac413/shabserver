import models from 'Models'

export default async function deleteCommentOnSponsoredPost(
  { commentId, postId },
  context
) {
  const { activeProfileId } = context

  const post = await models.SponsoredPost.findOne({ _id: postId })
  if (!post) {
    throw new Error(`No sponsored post with ${postId} not existing`)
  }
  const idx = post.comments.findIndex((comment) => comment._id === commentId)
  if (idx < 0) {
    throw new Error(
      `No comment with ${commentId} for sponsored post ${postId} not existing`
    )
  }

  const postComment = post.comments[idx]
  if (postComment.commentedBy !== activeProfileId) {
    throw new Error('You are not allowed to remove this comment')
  }

  post.comments.splice(idx, 1)

  await post.save()
  return { commentId, postId }
}
