import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { deleteMedia } from 'Connectors/media'
import { checkAccessToPost, deleteComment } from 'Connectors/post'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { FlaggedContentType } from 'Models/flaggedContent/enums'
import { NotificationActionType } from 'Models/notification/enums'
import { postNotificationTypes } from 'Models/notification'
import { eventManager } from 'Events'
import { deleteFlaggedContentsForResource } from 'Utils/admin'
import { Roles } from 'Utils/globals'

async function deleteFlaggedContents(post) {
  return deleteFlaggedContentsForResource(post._id, FlaggedContentType.POST)
}

async function deletePostComments(post, context) {
  const comments = await models.PostComment.find({ postId: post._id })
    .select({ _id: 1 })
    .lean()
  await Promise.all(
    comments.map((comment) =>
      deleteComment(
        {
          commentId: comment._id,
          postId: post._id,
        },
        context,
        false
      )
    )
  )
}

async function deletePostLikes(post) {
  await models.PostLike.deleteMany({
    postId: post._id,
  })
}

async function deletePostViews(post) {
  await models.PostView.deleteMany({
    postId: post._id,
  })
}

async function deleteRelatedMedia(post) {
  // delete the related media attachments
  const media = await models.Media.findOne({
    'reference.postId': post._id,
  })
  if (media) {
    await deleteMedia({ id: media._id, keepOriginal: false })
  }
}

async function deleteNotifications(post) {
  await models.Notification.deleteMany({
    type: { $in: postNotificationTypes },
    'actions.0.payload.feedItemId': post._id,
    'actions.0.type': NotificationActionType.VIEW_POST,
  })
}

export async function deletePost({ id }, context) {
  const { activeProfileId, role } = context
  const post = await models.Post.findById(id)
  if (!post) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID, {
      postId: id,
    })
  }
  if (role !== Roles.Admin && post.postedBy !== activeProfileId) {
    throw new ForbiddenError(ERRORS_BY_CODE.DELETE_POST_COMMENT_FORBIDDEN)
  }

  const hasAccess = await checkAccessToPost(post, context)
  if (!hasAccess) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }

  await Promise.all([
    deleteFlaggedContents(post),
    deletePostComments(post, context),
    deletePostLikes(post),
    deletePostViews(post),
    deleteNotifications(post),
  ])
  await deleteRelatedMedia(post)

  const postObj = post.toObject()
  await post.remove()

  eventManager.emit(eventManager.events.POST_DELETED, { post: postObj })
  return { id }
}
