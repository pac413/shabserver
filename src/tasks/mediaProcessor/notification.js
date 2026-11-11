import models from 'Models'
import { createNewNotification } from 'Connectors/notification'
import { MediaSubType, MediaType } from 'Models/media/enums'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { PostType } from 'Models/post/enums'

export const triggerNotification = async (messageObj) => {
  const {
    id,
    ownerId,
    mediaType,
    mediaSubType,
    reference: refereneStr,
  } = messageObj

  const reference = JSON.parse(refereneStr)
  let notificationType = ''
  let mediaTypeStr = ''
  const actions = []

  if (mediaType === MediaType.PICTURE) {
    notificationType = NotificationType.POST_PICTURE_PROCESSED
    mediaTypeStr = 'Picture'
  } else {
    notificationType = NotificationType.POST_VIDEO_PROCESSED
    mediaTypeStr = 'Video'
  }

  if (mediaSubType === MediaSubType.POST) {
    const post = await models.Post.findById(reference.postId).lean()
    if (!post || post.postedBy !== ownerId) {
      return
    }
    // Shouldn't generate notifications when media is related to the system generated posts
    if (post.type !== PostType.DEFAULT) {
      return
    }
    if (post) {
      actions.push({
        name: 'View',
        label: { name: 'notification.post-media-processed.view' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.VIEW_POST,
        payload: {
          feedItemId: post._id,
        },
        actionUrl: `/posts/status_update/${post._id}`,
      })
    }
  } else if (mediaSubType === MediaSubType.COMMENT) {
    const comment = await models.PostComment.findOne({
      _id: reference.commentId,
      postId: reference.postId,
    }).lean()
    if (comment) {
      actions.push({
        name: 'View',
        label: { name: 'notification.comment-media-processed.view' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.VIEW_POST,
        payload: {
          feedItemId: comment.postId,
          commentId: comment._id,
        },
        actionUrl: `/posts/status_update/${comment.postId}`,
      })
    }
  } else if (mediaSubType === MediaSubType.COMMENT_REPLY) {
    const reply = await models.PostComment.findOne({
      _id: reference.commentReplyId,
      postId: reference.postId,
      commentId: reference.commentId,
    }).lean()
    if (reply) {
      actions.push({
        name: 'View',
        label: { name: 'notification.comment_reply-media-processed.view' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.VIEW_POST,
        payload: {
          feedItemId: reply.postId,
          commentId: reply.commentId,
          commentReplyId: reply._id,
        },
        actionUrl: `/posts/status_update/${reply.postId}`,
      })
    }
  }

  console.log('Trigger notification to the owner: ', ownerId)
  // send a notification to the media owner
  await createNewNotification({
    profile: ownerId,
    triggeredBy: ownerId,
    type: notificationType,
    title: { name: `notification.${mediaSubType}-media-processed.title` },
    content: {
      name: `notification.${mediaSubType}-media-processed.content`,
      variables: {
        mediaType: mediaTypeStr,
      },
    },
    status: NotificationStatus.NEW,
    referenceId: id,
    actions,
  })
}
