import { orderBy } from 'lodash'
import moment from 'moment'
import models from 'Models'

export default async function createCommentOnSponsoredPost(
  commentPayload,
  context
) {
  const { activeProfileId } = context
  const { postId, ...commentParams } = commentPayload

  const post = await models.SponsoredPost.findOne({ _id: postId })

  if (!post) {
    throw new Error(`No sponsored post with ${postId} not existing`)
  }

  // TODO: Check if you are allowed to add comment to this post.
  const createdDate = moment.utc().toDate()
  const newComment = {
    commentedBy: activeProfileId,
    replies: [],
    createdAt: createdDate,
    date: createdDate,
    ...commentParams,
  }

  post.comments = orderBy([newComment, ...post.comments], ['date'], ['desc'])

  await post.save()

  return newComment
}
