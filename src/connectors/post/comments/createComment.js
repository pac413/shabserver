import { UserInputError } from 'apollo-server-errors'
import moment from 'moment'
import { createNewNotification } from 'Connectors/notification'
import {
  checkAccessToPost,
  bumpPostIfNeeded,
  getIsHiddenOrFlaggedComment,
} from 'Connectors/post'
import { isFeedRestricted } from 'Connectors/user'
import { getAvatar, getLocationString } from 'Connectors/profile'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { sendNewCommentOnPostEmail } from 'Services/email'
import { THUMBNAILS, FRONTEND_URL } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'
import { truncateWords } from 'Utils/string'
import { prepareContent } from 'Utils/feed'

export async function createComment(commentPayload, context) {
  const { activeProfileId } = context
  const { postId, commentId, ...commentParams } = commentPayload
  const [activeProfile, post] = await Promise.all([
    models.Profile.getRestrictions(activeProfileId),
    models.Post.findById(postId),
  ])

  const hasAccess = await checkAccessToPost(post, context)
  if (!hasAccess) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }

  const createdDate = moment.utc().toDate()
  const fields = {
    commentedBy: activeProfileId,
    postId,
    commentId: commentId || null,
    date: createdDate,
    hidden: isFeedRestricted(activeProfile),
    ...commentParams,
  }
  fields.isHiddenOrFlagged = getIsHiddenOrFlaggedComment(fields)
  const comment = await models.PostComment.create(fields)

  bumpPostIfNeeded(post, createdDate)

  await post.save()

  eventManager.emit(eventManager.events.POST_UPDATED, { post: post.toObject() })
  createNewCommentOnPostNotification(post, comment)

  return comment
}

const createNewCommentOnPostNotification = async (post, newComment) => {
  if (
    newComment.commentedBy === post.postedBy ||
    post.isHiddenOrFlagged ||
    newComment.isHiddenOrFlagged
  ) {
    return
  }
  const [commentor, owner] = await Promise.all([
    models.Profile.findById(newComment.commentedBy).lean(),
    models.Profile.findById(post.postedBy).lean(),
  ])
  const postUrl = `/posts/status_update/${post._id}?comment=${newComment._id}`
  const absolutePostUrl = `${FRONTEND_URL}${postUrl}`

  await createNewNotification({
    profile: post.postedBy,
    triggeredBy: newComment.commentedBy,
    type: NotificationType.POST_COMMENTED,
    title: { name: 'notification.new-comment-on-post.title' },
    content: {
      name: 'notification.new-comment-on-post.content',
      variables: {
        profileUrl: getProfileUrl(commentor),
        firstName: commentor.firstName,
        lastName: commentor.lastName,
        content: prepareContent(post),
      },
    },
    status: NotificationStatus.NEW,
    referenceId: newComment._id,
    actions: [
      {
        name: 'view',
        label: { name: 'notification.new-comment-on-post.view' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.VIEW_POST,
        payload: {
          postId: post._id,
          commentId: newComment._id,
        },
        actionUrl: postUrl,
      },
    ],
  })

  await sendNewCommentOnPostEmail({
    profileId: owner._id,
    profileEmail: owner.email,
    profileFirstName: owner.firstName,
    commentor: {
      firstName: commentor.firstName,
      lastName: commentor.lastName,
      location: getLocationString(commentor),
      avatarUrl: await getAvatar(commentor, THUMBNAILS.MEDIUM),
      profileUrl: getProfileUrl(commentor),
    },
    contentOwner: {
      firstName: owner.firstName,
      lastName: owner.lastName,
      location: getLocationString(owner),
      avatarUrl: await getAvatar(owner, THUMBNAILS.MEDIUM),
      profileUrl: getProfileUrl(commentor),
    },
    contentOwnerEmail: owner.email,
    commentText: truncateWords(newComment.content, 20),
    contentSummary: post.content.content
      ? truncateWords(post.content.content, 20)
      : '',
    contentUrl: absolutePostUrl,
  })
}
