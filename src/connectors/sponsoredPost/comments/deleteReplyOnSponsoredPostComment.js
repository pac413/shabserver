import models from 'Models'

export default async function deleteReplyOnSponsoredPostComment(
  { commentId, commentReplyId, postId },
  context
) {
  const { activeProfileId } = context

  const post = await models.SponsoredPost.findOne({ _id: postId })
  if (!post) {
    throw new Error(`No sponsored post with ${postId} not existing`)
  }

  const comment = post.comments.find((comment) => comment._id === commentId)
  if (!comment) {
    throw new Error(
      `No post comment with ${commentId} for sponsored post with ${postId} not existing`
    )
  }

  const idx = comment.replies.findIndex(
    (commentReply) => commentReply._id === commentReplyId
  )
  if (idx < 0) {
    throw new Error(`No post comment reply with ${commentReplyId}`)
  }

  const postCommentReply = post.comments[idx]
  if (postCommentReply.commentedBy !== activeProfileId) {
    throw new Error('You are not allowed to remove this comment reply')
  }

  comment.replies.splice(idx, 1)

  await post.save()

  return { commentId, postId }
}
