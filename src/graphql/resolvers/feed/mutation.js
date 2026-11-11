import {
  createPost,
  deletePost,
  hidePostFromFeed,
  updatePost,
  createComment,
  deleteComment,
  updateComment,
  createLike,
  deleteLike,
  sharePost,
} from 'Connectors/post'
import { validatePostIdInput } from './helpers'

export default {
  createPost: async (_, { input }, context) => {
    const post = await createPost(input, context)
    return post
  },
  updatePost: async (_, { input }, context) => {
    validatePostIdInput(input, 'id')
    const { id, content, webScraped } = input
    return await updatePost({ _id: id, content, webScraped }, context)
  },
  deletePost: async (_, { input }, context) => {
    validatePostIdInput(input, 'id')
    await deletePost(input, context)
    return {
      id: input.id,
      feedItemId: input.id,
    }
  },
  hidePostFromFeed: async (_, { input }, context) => {
    return hidePostFromFeed(input, context)
  },

  createCommentOnFeedItem: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await createComment(input, context)
  },
  createReplyOnComment: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await createComment(input, context)
  },
  createLikeOnComment: async (_, { input }, context) => {
    validatePostIdInput(input)
    const { isNew, like, total } = await createLike(input, context)
    return {
      postId: like.postId,
      feedItemId: like.postId,
      commentId: like.commentId,
      isNew,
      like,
      total,
    }
  },
  createLikeOnCommentReply: async (_, { input }, context) => {
    validatePostIdInput(input)
    const commentId = input.commentReplyId || input.commentId
    const { isNew, like, total } = await createLike(
      {
        ...input,
        commentId,
      },
      context
    )
    return {
      postId: like.postId,
      feedItemId: like.postId,
      commentId: input.commentId,
      commentReplyId: input.commentReplyId,
      isNew,
      like,
      total,
    }
  },
  updateCommentOnFeedItem: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await updateComment(input, context)
  },
  updateReplyOnComment: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await updateComment(
      { ...input, commentId: input.commentReplyId || input.commentId },
      context
    )
  },
  deleteCommentOnFeedItem: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await deleteComment(input, context)
  },
  deleteReplyOnComment: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await deleteComment(
      {
        postId: input.postId,
        commentId: input.commentReplyId || input.commentId,
      },
      context
    )
  },
  deleteLikeOnComment: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await deleteLike(input, context)
  },
  deleteLikeOnCommentReply: async (_, { input }, context) => {
    validatePostIdInput(input)
    const commentId = input.commentReplyId || input.commentId
    const { likeId, postId, total } = await deleteLike(
      { ...input, commentId },
      context
    )

    return {
      postId,
      feedItemId: postId,
      commentId: input.commentId,
      commentReplyId: input.commentReplyId,
      likeId,
      total,
    }
  },

  createLikeOnFeedItem: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await createLike(input, context)
  },
  deleteLikeOnFeedItem: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await deleteLike(input, context)
  },

  shareFeedItem: async (_, { input }, context) => {
    validatePostIdInput(input)
    return await sharePost(input, context)
  },
}
