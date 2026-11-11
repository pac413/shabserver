import { UserInputError } from 'apollo-server-errors'
import { ForbiddenError } from 'apollo-server-express'
import moment from 'moment'
import { checkAccessToPost, getEligibleForGeneralFeed } from 'Connectors/post'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { parseContent } from 'Utils/feed'
import { Roles } from 'Utils/globals'

export async function updatePost(postPayload, context) {
  const { _id: postId } = postPayload
  const originalPost = await models.Post.findById(postId)
  if (!originalPost) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID, { postId })
  }

  if (originalPost.readonly && context.role !== Roles.Admin) {
    console.error(
      `${context.activeProfileId} has tried to edit readonly post: ${originalPost._id}`
    )
    throw new ForbiddenError(ERRORS_BY_CODE.FEED_FORBIDDEN)
  }

  const hasAccess = await checkAccessToPost(originalPost, context)
  if (!hasAccess) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }

  originalPost.$set('contentUpdatedAt', moment.utc().toDate())
  for (const field in postPayload) {
    if (field === 'content') {
      originalPost.$set(field, parseContent(postPayload[field]))
    } else {
      originalPost.$set(field, postPayload[field])
      if (field === 'webScraped') {
        originalPost.$set(
          'eligibleForGeneralFeed',
          getEligibleForGeneralFeed({
            ...originalPost.toObject(),
            webScraped: postPayload[field],
          })
        )
      }
    }
  }
  await originalPost.save()

  eventManager.emit(eventManager.events.POST_UPDATED, { post: originalPost })
  return originalPost
}
