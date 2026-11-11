import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { Roles } from 'Utils/globals'

export async function updateComment(commentPayload, context) {
  const { activeProfileId, role } = context
  const { content, postId, commentId: id } = commentPayload
  const postComment = await models.PostComment.findOne({
    _id: id,
    postId,
  })

  if (!postComment) {
    throw new UserInputError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
  }
  if (role !== Roles.Admin && postComment.commentedBy !== activeProfileId) {
    throw new ForbiddenError(ERRORS_BY_CODE.UPDATE_POST_COMMENT_FORBIDDEN)
  }

  postComment.content = content
  await postComment.save()

  const post = await models.Post.findById(postId).lean()
  eventManager.emit(eventManager.events.POST_UPDATED, { post })

  return postComment
}
