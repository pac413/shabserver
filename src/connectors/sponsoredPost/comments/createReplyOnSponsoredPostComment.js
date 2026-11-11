import { orderBy } from 'lodash'
import moment from 'moment'
import models from 'Models'

export default async function createReplyOnSponsoredPostComment(
  commentReplyPayload,
  context
) {
  const { activeProfileId } = context
  const { commentId, postId, ...commentReplyParams } = commentReplyPayload

  const post = await models.SponsoredPost.findOne({ _id: postId })
  if (!post) {
    throw new Error(`No sponsored post with ${postId} not existing`)
  }

  // TODO: Check if you are allowed to add comment to this post.

  const comment = post.comments.find((comment) => comment._id === commentId)
  if (!comment) {
    throw new Error(
      `No post comment with ${commentId} for sponsored post with ${postId} not existing`
    )
  }

  const createdDate = moment.utc().toDate()
  const newCommentReply = {
    commentedBy: activeProfileId,
    createdAt: createdDate,
    date: createdDate,
    ...commentReplyParams,
  }

  comment.replies = orderBy(
    [newCommentReply, ...comment.replies],
    ['date'],
    ['desc']
  )

  await post.save()

  return newCommentReply
}
