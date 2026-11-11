import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { Roles } from 'Utils/globals'

export default async function deleteLike(likePayload, context) {
  const { activeProfileId, role } = context
  const { postId, commentId } = likePayload
  const like = await models.PostLike.findOne({
    likedBy: activeProfileId,
    postId,
    commentId: commentId || null,
  })
  if (!like) {
    throw new UserInputError(ERRORS_BY_CODE.POST_LIKE_NOT_FOUND)
  }
  if (role !== Roles.Admin && like.likedBy !== activeProfileId) {
    throw new ForbiddenError(ERRORS_BY_CODE.DELETE_POST_LIKE_FORBIDDEN)
  }

  await like.remove()
  const total = await models.PostLike.countDocuments({
    postId,
    commentId: commentId || null,
    likedBy: like.likedBy,
  })

  const post = await models.Post.findById(postId).lean()
  eventManager.emit(eventManager.events.POST_UPDATED, { post })

  // remove related notification
  await models.Notification.deleteOne({
    referenceId: like._id,
  })

  return {
    likeId: like._id,
    postId,
    feedItemId: postId,
    commentId,
    total,
  }
}
