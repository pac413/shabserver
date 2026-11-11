import models from 'Models'

export default async function updateReplyOnSponsoredPostComment(
  commentReplyPayload,
  context
) {
  const { activeProfileId } = context
  const { commentId, commentReplyId, content, postId } = commentReplyPayload

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
    throw new Error('You are not allowed to update this comment reply')
  }

  postCommentReply.content = content
  await post.save()

  return postCommentReply
}
