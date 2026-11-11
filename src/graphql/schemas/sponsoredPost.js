import { gql } from 'apollo-server-express'

export default gql`
  type SponsoredPost {
    id: ID!
    content: String!
    comments: [PostComment]!
    likes: [PostLike]!
    views: [PostView]!
    postedBy: Profile!
    contentUpdatedAt: DateTime!
    type: SponsoredPostType!
  }

  input SponsoredPostByTypeInput {
    type: SponsoredPostType!
  }

  type DeleteSponsoredPostResponse {
    id: ID!
  }

  input CreateSponsoredPostInput {
    content: String!
    type: SponsoredPostType!
  }

  input UpdateSponsoredPostInput {
    content: String
    type: SponsoredPostType
  }

  input DeleteSponsoredPostInput {
    id: ID!
  }

  input CreateCommentOnSponsoredPostInput {
    postId: ID!
    content: String!
  }

  input CreateReplyOnSponsoredPostCommentInput {
    postId: ID!
    commentId: ID!
    content: String!
  }

  input UpdateCommentOnSponsoredPostInput {
    postId: ID!
    commentId: ID!
    content: String!
  }

  input UpdateReplyOnSponsoredPostCommentInput {
    postId: ID!
    commentId: ID!
    commentReplyId: ID!
    content: String!
  }

  input DeleteCommentOnSponsoredPostInput {
    postId: ID!
    commentId: ID!
  }

  type DeleteCommentOnSponsoredPostResponse {
    postId: ID!
    commentId: ID!
  }

  input DeleteReplyOnSponsoredPostCommentInput {
    postId: ID!
    commentId: ID!
    commentReplyId: ID!
  }

  type DeleteReplyOnSponsoredPostCommentResponse {
    postId: ID!
    commentId: ID!
    commentReplyId: ID!
  }

  input CreateLikeOnSponsoredPostInput {
    postId: ID!
  }

  input DeleteLikeOnSponsoredPostInput {
    postId: ID!
    likeId: ID!
  }

  type DeleteLikeOnSponsoredPostResponse {
    postId: ID!
    likeId: ID!
  }

  input CreateViewOnSponsoredPostInput {
    postId: ID!
  }

  extend type Query {
    sponsoredPostByType(input: SponsoredPostByTypeInput!): SponsoredPost!
  }

  extend type Mutation {
    createSponsoredPost(input: CreateSponsoredPostInput!): SponsoredPost!
    updateSponsoredPost(input: UpdateSponsoredPostInput!): SponsoredPost!
    deleteSponsoredPost(
      input: DeleteSponsoredPostInput!
    ): DeleteSponsoredPostResponse!

    createCommentOnSponsoredPost(
      input: CreateCommentOnSponsoredPostInput!
    ): PostComment!
    createReplyOnSponsoredPostComment(
      input: CreateReplyOnSponsoredPostCommentInput!
    ): PostCommentReply!
    updateCommentOnSponsoredPost(
      input: UpdateCommentOnSponsoredPostInput!
    ): PostComment!
    updateReplyOnSponsoredPostComment(
      input: UpdateReplyOnSponsoredPostCommentInput
    ): PostCommentReply!
    deleteCommentOnSponsoredPost(
      input: DeleteCommentOnSponsoredPostInput!
    ): DeleteCommentOnSponsoredPostResponse!
    deleteReplyOnSponsoredPostComment(
      input: DeleteReplyOnSponsoredPostCommentInput!
    ): DeleteReplyOnSponsoredPostCommentResponse!

    createLikeOnSponsoredPost(input: CreateLikeOnSponsoredPostInput!): PostLike!
    deleteLikeOnSponsoredPost(
      input: DeleteLikeOnSponsoredPostInput!
    ): DeleteLikeOnSponsoredPostResponse!

    createViewOnSponsoredPost(input: CreateViewOnSponsoredPostInput!): PostView!
  }
`
