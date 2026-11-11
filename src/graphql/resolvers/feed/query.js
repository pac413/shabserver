import {
  getAdminGeneralFeed,
  getAdminProfileFeed,
  getAvatarUpdatedPost,
  getCommentById,
  getComments,
  getCommentsCount,
  getLikes,
  getLikesCount,
  getGeneralFeed,
  getPostById,
  getProfileFeed,
  markPostsViewed,
} from 'Connectors/post'
import { getProfileSettings } from 'Connectors/profileSettings'
import { FeedContentSetting } from 'Models/profileSettings/enums'
import { Roles } from 'Utils/globals'
import { validatePostIdInput } from './helpers'

export default {
  feedItemById: async (_, { input }, context) => {
    validatePostIdInput(input, 'id')
    const post = await getPostById(input, context)
    markPostsViewed([post], context)
    return post
  },
  // general feed query
  feedItemsByProfileId: async (_, { input }, context) => {
    const { activeProfileId, role } = context
    const activeProfileSettings = await getProfileSettings(activeProfileId)
    let response
    if (
      role === Roles.Admin &&
      activeProfileSettings.feedContent === FeedContentSetting.ALL
    ) {
      response = await getAdminGeneralFeed(input, context)
    } else {
      response = await getGeneralFeed(input, context)
    }
    markPostsViewed(response.posts, context)
    return {
      total: response.total,
      feedItems: response.posts,
    }
  },
  // profile feed query
  profileFeedItems: async (_, { input }, context) => {
    const { activeProfileId, role } = context
    const activeProfileSettings = await getProfileSettings(activeProfileId)
    let response
    if (
      role === Roles.Admin &&
      activeProfileSettings.feedContent === FeedContentSetting.ALL
    ) {
      response = await getAdminProfileFeed(input, context)
    } else {
      response = await getProfileFeed(input, context)
    }
    markPostsViewed(response.posts, context)
    return {
      total: response.total,
      feedItems: response.posts,
    }
  },
  feedItemComments: async (_, { input }, context) => {
    validatePostIdInput(input)
    const { postId, limit, offset } = input
    const [comments, total] = await Promise.all([
      getComments({ postId }, { limit, offset }, context),
      getCommentsCount({ postId }, {}, context),
    ])
    return { comments, total }
  },
  feedItemLikes: async (_, { input }, context) => {
    validatePostIdInput(input)
    const { postId, limit, offset } = input
    const [likes, total] = await Promise.all([
      getLikes({ postId }, { limit, offset }, context),
      getLikesCount({ postId }, {}, context),
    ])
    return { likes, total }
  },
  commentLikes: async (_, { input }, context) => {
    validatePostIdInput(input)
    const { postId, commentId, limit, offset } = input
    const [likes, total] = await Promise.all([
      getLikes({ postId, commentId }, { limit, offset }, context),
      getLikesCount({ postId, commentId }, {}, context),
    ])
    return { likes, total }
  },
  avatarUpdatedFeedItem: async (_, { input }, context) => {
    return await getAvatarUpdatedPost(input, context)
  },
  commentById: async (_, { input }, context) => {
    validatePostIdInput(input)
    const { commentId: id, postId } = input
    return await getCommentById({ id, postId }, context)
  },
  commentReplyById: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await getCommentById(
      {
        id: input.commentReplyId || input.commentId,
        postId: input.postId,
      },
      context
    )
  },
}
