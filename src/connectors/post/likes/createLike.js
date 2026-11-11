import { UserInputError } from 'apollo-server-errors'
import moment from 'moment'
import { checkAccessToPost, bumpPostIfNeeded } from 'Connectors/post'
import { createNewNotification } from 'Connectors/notification'
import { getAvatar, getLocationString } from 'Connectors/profile'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { sendLikeOnPostEmail } from 'Services/email'
import { truncateWords } from 'Utils/string'
import { THUMBNAILS, FRONTEND_URL } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'
import { prepareContent } from 'Utils/feed'

export default async function createLike(likePayload, context) {
  const { activeProfileId } = context
  const { postId, commentId } = likePayload
  const post = await models.Post.findById(postId)

  const hasAccess = await checkAccessToPost(post, context)
  if (!hasAccess) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }

  const date = moment.utc().toDate()
  const fields = {
    postId,
    commentId: commentId || null,
    likedBy: activeProfileId,
    date,
  }

  const existingLike = await models.PostLike.findOne({
    postId: fields.postId,
    commentId: fields.commentId,
    likedBy: fields.likedBy,
  })

  if (existingLike) {
    const total = await models.PostLike.countDocuments({
      postId: fields.postId,
      commentId: fields.commentId,
    })

    return {
      isNew: false,
      like: existingLike,
      total,
    }
  }

  const like = await models.PostLike.create(fields)
  const total = await models.PostLike.countDocuments({
    postId: fields.postId,
    commentId: fields.commentId,
  })

  bumpPostIfNeeded(post, date)
  await post.save()

  eventManager.emit(eventManager.events.POST_UPDATED, { post: post.toObject() })
  createNewLikeOnPostNotification(post.toObject(), like)

  return {
    isNew: true,
    like,
    total,
  }
}

const createNewLikeOnPostNotification = async (post, newLike) => {
  if (newLike.likedBy === post.postedBy) {
    return
  }
  const [liker, owner] = await Promise.all([
    simpleProfileLoader.load(newLike.likedBy),
    simpleProfileLoader.load(post.postedBy),
  ])
  const postUrl = `/posts/status_update/${post._id}`
  const absolutePostUrl = `${FRONTEND_URL}${postUrl}`

  await createNewNotification({
    profile: post.postedBy,
    triggeredBy: newLike.likedBy,
    type: NotificationType.POST_LIKED,
    title: { name: 'notification.new-like-on-post.title' },
    content: {
      name: 'notification.new-like-on-post.content',
      variables: {
        profileUrl: getProfileUrl(liker),
        firstName: liker.firstName,
        lastName: liker.lastName,
        content: prepareContent(post),
      },
    },
    status: NotificationStatus.NEW,
    referenceId: newLike._id,
    actions: [
      {
        name: 'view',
        label: { name: 'notification.new-like-on-post.view' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.VIEW_POST,
        payload: {
          feedItemId: post._id,
        },
        actionUrl: postUrl,
      },
    ],
  })

  await sendLikeOnPostEmail({
    profileId: owner._id,
    profileEmail: owner.email,
    profileFirstName: owner.firstName,
    liker: {
      firstName: liker.firstName,
      lastName: liker.lastName,
      location: getLocationString(liker),
      avatarUrl: await getAvatar(liker, THUMBNAILS.MEDIUM),
      profileUrl: getProfileUrl(liker),
    },
    contentOwner: {
      firstName: owner.firstName,
      lastName: owner.lastName,
      location: getLocationString(owner),
      avatarUrl: await getAvatar(owner, THUMBNAILS.MEDIUM),
      profileUrl: getProfileUrl(owner),
    },
    contentOwnerEmail: owner.email,
    contentSummary: post.content.content
      ? truncateWords(post.content.content, 20)
      : '',
    contentUrl: absolutePostUrl,
  })
}
