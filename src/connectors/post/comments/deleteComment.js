import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { deleteMedia } from 'Connectors/media'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { FlaggedContentType } from 'Models/flaggedContent/enums'
import { deleteFlaggedContentsForResource } from 'Utils/admin'
import { Roles } from 'Utils/globals'

const deleteCommentReplies = async (comment) => {
  const { _id: id, commentId, postId } = comment
  // No comment replies for comment reply
  if (commentId) {
    return
  }

  // Delete comment replies for comment
  await models.PostComment.deleteMany({
    postId,
    commentId: id,
  })
}

const deleteFlaggedContentForComment = async (comment) => {
  const { _id: id, postId } = comment
  const resourceId = `${postId}__${id}`
  return deleteFlaggedContentsForResource(
    resourceId,
    FlaggedContentType.COMMENT
  )
}

const deleteFlaggedContentForReply = async (comment) => {
  const { _id: id, commentId, postId } = comment
  const resourceId = `${postId}__${commentId}__${id}`
  return deleteFlaggedContentsForResource(
    resourceId,
    FlaggedContentType.COMMENT_REPLY
  )
}

const deleteFlaggedContents = async (comment) => {
  const { _id: id, commentId, postId } = comment

  if (commentId) {
    // clean up the related flagged contents for this comment
    return deleteFlaggedContentForReply(comment)
  }

  const replies = await models.PostComment.find({
    postId,
    commentId: id,
  })
  await Promise.all(replies.map((reply) => deleteFlaggedContentForReply(reply)))
  return deleteFlaggedContentForComment(comment)
}

/**
 * Delete related medias
 * - if "comment" is comment, remove medias attached to that comment and reply threads for that comment.
 * - if "comment" is comment reply, remove media attached to that comment reply only.
 */
const deleteRelatedMedia = async (comment) => {
  const { _id: id, postId, commentId } = comment

  // Delete the related media attachments
  const relatedMedia = await models.Media.find({
    'reference.postId': postId,
    ...(commentId
      ? { 'reference.commentId': commentId, 'reference.commentReplyId': id }
      : { 'reference.commentId': id }),
  })
    .select({ _id: true })
    .lean()
  await Promise.all([
    relatedMedia.forEach((media) =>
      deleteMedia({ id: media._id, keepOriginal: false })
    ),
  ])
}

export async function deleteComment(
  { postId, commentId },
  context,
  checkAccess = true
) {
  const { activeProfileId, role } = context
  const comment = await models.PostComment.findOne({
    _id: commentId,
    postId,
  })
  if (!comment) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_COMMENT_ID)
  }
  if (
    checkAccess &&
    role !== Roles.Admin &&
    comment.commentedBy !== activeProfileId
  ) {
    throw new ForbiddenError(ERRORS_BY_CODE.DELETE_POST_COMMENT_FORBIDDEN)
  }

  await Promise.all([
    deleteFlaggedContents(comment),
    deleteRelatedMedia(comment),
    deleteCommentReplies(comment),
  ])

  await comment.remove()

  const total = await models.PostComment.countDocuments({
    postId,
    commentId: commentId || null,
  })

  const post = await models.Post.findById(postId)
  eventManager.emit(eventManager.events.POST_UPDATED, { post: post.toObject() })

  return {
    commentId,
    postId,
    total,
  }
}
