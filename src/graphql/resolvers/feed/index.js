import * as Sentry from '@sentry/node'
import {
  getComments,
  getCommentsCount,
  getLikes,
  getLikesCount,
} from 'Connectors/post'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import models from 'Models'
import { MediaSubType } from 'Models/media/enums'
import { getTranslatedText } from 'Utils/i18n'
import Query from './query'
import Mutation from './mutation'
import Subscription from './subscription'

const commentResolvers = {
  id: (comment) => comment.id || comment._id,
  commentedBy: async (comment, _, context) => {
    const profile = await simpleProfileLoader.load(comment.commentedBy)
    if (!profile) {
      console.error('INVALID_FEED_COMMENTED_BY', { comment, context })
      Sentry.captureException(
        new Error('INVALID_FEED_COMMENTED_BY', { comment, context })
      )
    }
    return profile
  },
  commentLikesCount: async (comment, args, context) => {
    const count = await getLikesCount(
      {
        postId: comment.postId,
        commentId: comment._id,
      },
      args,
      context
    )
    return count
  },
  commentLikes: async (comment, args, context) => {
    const likes = await getLikes(
      {
        postId: comment.postId,
        commentId: comment._id,
      },
      args,
      context
    )
    return likes
  },
}

export default {
  Query,
  Mutation,
  Subscription,
  FeedItem: {
    id: (parent) => parent._id,
    postId: (parent) => parent._id,
    content: (post, _, { locale }) => {
      const { content, name, variables } = post.content
      if (name) {
        return getTranslatedText({ name, variables }, locale)
      }
      return content
    },
    likedByProfile: async (post, _, { activeProfileId }) => {
      const hasPostLiked = await models.PostLike.exists({
        postId: post._id,
        likedBy: activeProfileId,
        commentId: null,
      })

      return hasPostLiked
    },
    commentsCount: async (post, args, context) => {
      const count = await getCommentsCount({ postId: post._id }, args, context)
      return count
    },
    latestComments: async (post, { limit, offset }, context) => {
      const comments = await getComments(
        { postId: post._id },
        { limit, offset },
        context
      )
      return comments
    },
    viewsCount: async (post) => {
      const count = await models.PostView.countDocuments({
        postId: post._id,
      })
      return count + (post.migratedViewsCount || 0)
    },
    likesCount: async (post, args, context) => {
      const count = await getLikesCount({ postId: post._id }, args, context)
      return count
    },
    latestLikes: async (post, { limit, offset }, context) => {
      const likes = await getLikes(
        { postId: post._id },
        { limit, offset },
        context
      )
      return likes
    },
    medias: async (post) => {
      const medias = await models.Media.find({
        ownerId: post.postedBy,
        mediaSubType: MediaSubType.POST,
        'reference.postId': post._id,
      })
      return medias || []
    },
    postedBy: async (post, _, context) => {
      const profile = await simpleProfileLoader.load(post.postedBy)
      if (!profile) {
        console.error('INVALID_FEED_POSTED_BY', { post, context })
        Sentry.captureException(
          new Error('INVALID_FEED_POSTED_BY', { post, context })
        )
      }
      return profile
    },
    postType: (post) => post.type,
    postedDate: (post) => post.createdAt,
    shared: async (post, _, { activeProfileId }) => {
      const postShareItems = post.share || []
      const shareItem = postShareItems.find(
        (item) => item.sharedTo === activeProfileId
      )

      return !!shareItem
    },
  },
  PostComment: {
    ...commentResolvers,
    likedByProfile: async (comment, _, { activeProfileId }) => {
      const hasCommentLiked = await models.PostLike.exists({
        postId: comment.postId,
        likedBy: activeProfileId,
        commentId: comment._id,
      })

      return hasCommentLiked
    },
    repliesCount: async (comment, args, context) => {
      const count = await getCommentsCount(
        { postId: comment.postId, commentId: comment._id },
        args,
        context
      )
      return count
    },
    replies: async (comment, args, context) => {
      const comments = await getComments(
        {
          postId: comment.postId,
          commentId: comment._id,
        },
        args,
        context
      )
      return comments
    },
    medias: (parent) =>
      models.Media.find({
        ownerId: parent.commentedBy,
        mediaSubType: MediaSubType.COMMENT,
        'reference.commentId': parent._id,
      }),
  },
  PostCommentReply: {
    ...commentResolvers,
    likedByProfile: async (comment, _, { activeProfileId }) => {
      const hasCommentLiked = await models.PostLike.exists({
        postId: comment.postId,
        likedBy: activeProfileId,
        commentId: comment._id,
      })

      return hasCommentLiked
    },
    medias: (parent) =>
      models.Media.find({
        ownerId: parent.commentedBy,
        mediaSubType: MediaSubType.COMMENT_REPLY,
        'reference.commentId': parent.commentId,
        'reference.commentReplyId': parent._id,
      }),
  },
  PostLike: {
    id: (parent) => parent.id || parent._id,
    likedBy: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.likedBy)
      if (!profile) {
        console.error('INVALID_FEED_LIKED_BY', { parent, context })
        Sentry.captureException(
          new Error('INVALID_FEED_LIKED_BY', { parent, context })
        )
      }
      return profile
    },
  },
  PostView: {
    id: (parent) => parent.id || parent._id,
    viewedBy: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.viewedBy)
      if (!profile) {
        console.error('INVALID_FEED_VIEWED_BY', { parent, context })
        Sentry.captureException(
          new Error('INVALID_FEED_VIEWED_BY', { parent, context })
        )
      }
      return profile
    },
  },
}
