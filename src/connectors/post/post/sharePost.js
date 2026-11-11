import { UserInputError } from 'apollo-server-errors'
import { checkAccessToPost } from 'Connectors/post'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import { models } from 'Models'
import { duplicatePost } from './duplicatePost'

export async function sharePost(input, context) {
  const originalPost = await models.Post.findById(input.postId)

  // check if active profile has permission to access this post
  const hasAccess = await checkAccessToPost(originalPost, context)
  if (!hasAccess) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }

  // duplicate post for activeProfileId
  const post = await duplicatePost(originalPost, context)

  // add a new item into share field of originalPost
  const { activeProfileId } = context
  const newShare = originalPost.share || []
  newShare.push({
    sharedTo: activeProfileId,
    sharedPostId: post._id,
  })
  originalPost.share = newShare
  await originalPost.save()

  eventManager.emit(eventManager.events.POST_UPDATED, { post: originalPost })
  return originalPost
}
