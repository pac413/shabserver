import {
  getSponsoredPostByType,
  createSponsoredPost,
  updateSponsoredPost,
  deleteSponsoredPost,
  createCommentOnSponsoredPost,
  createReplyOnSponsoredPostComment,
  updateCommentOnSponsoredPost,
  updateReplyOnSponsoredPostComment,
  deleteCommentOnSponsoredPost,
  deleteReplyOnSponsoredPostComment,
  createLikeOnSponsoredPost,
  deleteLikeOnSponsoredPost,
  createViewOnSponsoredPost,
} from 'Connectors/sponsoredPost'

export default {
  Query: {
    sponsoredPostByType: async (_, { input }, context) => {
      return await getSponsoredPostByType(input, context)
    },
  },
  Mutation: {
    createSponsoredPost: async (_, { input }, context) => {
      return await createSponsoredPost(input, context)
    },
    updateSponsoredPost: async (_, { input }, context) => {
      const { id, content } = input
      return await updateSponsoredPost({ _id: id, content }, context)
    },
    deleteSponsoredPost: async (_, { input }, context) => {
      return await deleteSponsoredPost(input, context)
    },

    createCommentOnSponsoredPost: async (_, { input }, context) => {
      return await createCommentOnSponsoredPost(input, context)
    },
    createReplyOnSponsoredPostComment: async (_, { input }, context) => {
      return await createReplyOnSponsoredPostComment(input, context)
    },
    updateCommentOnSponsoredPost: async (_, { input }, context) => {
      return await updateCommentOnSponsoredPost(input, context)
    },
    updateReplyOnSponsoredPostComment: async (_, { input }, context) => {
      return await updateReplyOnSponsoredPostComment(input, context)
    },
    deleteCommentOnSponsoredPost: async (_, { input }, context) => {
      return await deleteCommentOnSponsoredPost(input, context)
    },
    deleteReplyOnSponsoredPostComment: async (_, { input }, context) => {
      return await deleteReplyOnSponsoredPostComment(input, context)
    },

    createLikeOnSponsoredPost: async (_, { input }, context) => {
      return await createLikeOnSponsoredPost(input, context)
    },
    deleteLikeOnSponsoredPost: async (_, { input }, context) => {
      return await deleteLikeOnSponsoredPost(input, context)
    },

    createViewOnSponsoredPost: async (_, { input }, context) => {
      return await createViewOnSponsoredPost(input, context)
    },
  },
  SponsoredPost: {
    id: (parent) => parent.id || parent._id,
  },
  PostComment: {
    id: (parent) => parent.id || parent._id,
  },
  PostCommentReply: {
    id: (parent) => parent.id || parent._id,
  },
  PostLike: {
    id: (parent) => parent.id || parent._id,
  },
  PostView: {
    id: (parent) => parent.id || parent._id,
  },
}
