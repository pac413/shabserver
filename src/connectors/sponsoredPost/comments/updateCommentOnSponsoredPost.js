import models from 'Models'

export default async function updateCommentOnSponsoredPost(
  commentPayload,
  context
) {
  const { activeProfileId } = context
  const { commentId, content, postId } = commentPayload

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

  postComment.content = content

  await post.save()
  return postComment
}
