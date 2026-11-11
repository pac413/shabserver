import { gql } from 'apollo-server-express'

export default gql`
  "TODO: Remove this"
  type PostCommentReply {
    id: ID!
    postId: ID!
    content: String!
    webScraped: WebScrapedBasic
    commentedBy: SimpleProfile!
    likedByProfile: Boolean!
    commentLikes(offset: Int = 0, limit: Int = 2): [PostLike]!
    commentLikesCount: Int!
    medias: [Media]
    date: DateTime!

    commentId: ID!
  }

  "TODO: Merge this with Comment and rename this to 'Comment'"
  type PostComment {
    id: ID!
    postId: ID!
    content: String!
    webScraped: WebScrapedBasic
    commentedBy: SimpleProfile!
    likedByProfile: Boolean!
    commentLikes(offset: Int = 0, limit: Int = 2): [PostLike]!
    commentLikesCount: Int!
    medias: [Media]
    date: DateTime!

    repliesCount: Int!
    replies(offset: Int = 0, limit: Int = Infinite): [PostCommentReply]!
  }

  type PostLike {
    id: ID!
    likedBy: SimpleProfile!
    postId: ID!
    commentId: ID
    date: DateTime!
  }

  type PostView {
    id: ID!
    postId: ID!
    viewedBy: SimpleProfile!
    date: DateTime!
  }

  type PostShare {
    sharedTo: ID!
    sharedPostId: String!
    sharedFeedItemId: String!
  }

  "TODO: Remove this FeedItem and rename to Post"
  type FeedItem {
    id: ID!
    content: String!
    webScraped: WebScrapedPost
    postContentUpdatedAt: String!
    postId: ID!
    postType: PostType!
    commentsCount: Int!
    viewsCount: Int!
    likesCount: Int!
    latestComments(offset: Int = 0, limit: Int = 2): [PostComment]!
    latestLikes(offset: Int = 0, limit: Int = 2): [PostLike]!
    likedByProfile: Boolean!
    medias: [Media]
    postedBy: SimpleProfile!
    flagged: Boolean
    shared: Boolean
    readonly: Boolean
    postedDate: DateTime!
    lastActivityAt: DateTime
    status: FeedItemStatus!
    privacySetting: PostPrivacySetting!
  }

  input CreatePostInput {
    content: String!
    webScraped: WebScrapedPostInput
  }

  input UpdatePostInput {
    "TODO: id should be required after deprecated field is removed"
    id: ID
    feedItemId: ID @deprecated(reason: "Use id instead of feedItemId")
    content: String!
    webScraped: WebScrapedPostInput
  }

  input DeletePostInput {
    "TODO: id should be required after deprecated field is removed"
    id: ID
    feedItemId: ID @deprecated(reason: "Use id instead of feedItemId")
  }

  input HidePostFromFeedInput {
    id: ID
  }

  type HidePostFromFeedResponse {
    id: ID
  }

  type DeletePostResponse {
    "TODO: id should be required after deprecated field is removed"
    id: ID
    feedItemId: ID @deprecated(reason: "Use id instead of feedItemId")
  }

  "TODO: rename to CreateCommentInput"
  input CreateCommentOnFeedItemInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    content: String!
    webScraped: WebScrapedBasicInput
  }

  "TODO: Merge this with CreateCommentInput"
  input CreateReplyOnCommentInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    content: String!
    webScraped: WebScrapedBasicInput
  }

  "TODO: Merge this with CreateLikeInput"
  input CreateLikeOnCommentInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
  }

  "TODO: Merge this with CreateLike mutation response type"
  type LikeOnCommentResponse {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    isNew: Boolean!
    like: PostLike!
    total: Int!
  }

  "TODO: Merge this with CreateLikeInput"
  input CreateLikeOnCommentReplyInput {
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
  }

  "TODO: Merge this with CreateLike mutation response type"
  type LikeOnCommentReplyResponse {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
    isNew: Boolean!
    like: PostLike!
    total: Int!
  }

  "TODO: Rename this to UpdateCommentInput"
  input UpdateCommentOnFeedItemInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    content: String!
    webScraped: WebScrapedBasicInput
  }

  "TODO: Merge this with UpdateCommentInput"
  input UpdateReplyOnCommentInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
    content: String!
    webScraped: WebScrapedBasicInput
  }

  "TODO: Rename this to DeleteCommentInput"
  input DeleteCommentOnFeedItemInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
  }

  "TODO: Rename this to DeleteCommentResponse"
  type DeleteCommentOnFeedItemResponse {
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    total: Int!
  }

  "TODO: Merge this with DeleteCommentInput"
  input DeleteReplyOnCommentInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
  }

  "TODO: Merge this with DeleteCommentResponse"
  type DeleteReplyOnCommentResponse {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
  }

  "TODO: Rename this to CreateLikeInput"
  input CreateLikeOnFeedItemInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
  }

  "TODO: Rename this to CreateLikeResponse"
  type CreateLikeOnFeedItemResponse {
    isNew: Boolean!
    like: PostLike!
    total: Int!
  }

  "TODO: Rename this to DeleteLikeInput"
  input DeleteLikeOnFeedItemInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
  }

  "TODO: Rename this to DeleteLikeResponse"
  type DeleteLikeOnFeedItemResponse {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    likeId: ID!
    total: Int!
  }

  "TODO: Rename to CreateViewInput"
  input CreateViewOnFeedItemInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
  }

  "TODO: Merge this with DeleteLikeInput"
  input DeleteLikeOnCommentInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
  }

  "TODO: Merge this with DeleteLikeResponse"
  type DeleteLikeOnCommentResponse {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    likeId: ID!
  }

  "TODO: Merge this with DeleteLikeInput"
  input DeleteLikeOnCommentReplyInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
  }

  "TODO: Merge this with DeleteLikeResponse"
  type DeleteLikeOnCommentReplyResponse {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
    likeId: ID!
  }

  "TODO: Rename this to PostByIdInput"
  input FeedItemByIdInput {
    "TODO: postId should be required after deprecated field is removed"
    id: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
  }

  "TODO: Rename this to GeneralFeedInput"
  input FeedItemsByProfileIdInput {
    profileId: ID
    # pagination
    limit: Int!
    offset: Int!
  }

  "TODO: Rename this to ProfileFeedInput"
  input ProfileFeedItemsInput {
    profileId: ID
    # pagination
    limit: Int!
    offset: Int!
  }

  "TODO: Rename this to ProfileFeedInput"
  input FeedItemCommentsInput {
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    # pagination
    limit: Int!
    offset: Int!
  }

  "TODO: Use Post.comments"
  type FeedItemCommentsPayload {
    total: Int!
    comments: [PostComment]!
  }

  "TODO: Use Post.likes"
  input FeedItemLikesInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    # pagination
    limit: Int!
    offset: Int!
  }

  "TODO: Use Post.likes"
  type FeedItemLikesPayload {
    total: Int!
    likes: [PostLike]!
  }

  "TODO: Rename to Feed"
  type FeedItemsPayload {
    total: Int!
    feedItems: [FeedItem]!
  }

  input CommentLikesInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID
    # pagination
    limit: Int!
    offset: Int!
  }

  "TODO: Rename this to AvatarUpdatedPostInput"
  input AvatarUpdatedFeedItemInput {
    profileId: ID
  }

  input CommentByIdInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
  }

  "TODO: Merge this with CommentByIdInput"
  input CommentReplyByIdInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
    commentId: ID!
    commentReplyId: ID!
  }

  "TODO: Rename this to SharePostInput"
  input ShareFeedItemInput {
    "TODO: postId should be required after deprecated field is removed"
    postId: ID
    feedItemId: ID @deprecated(reason: "Use postId instead of feedItemId")
  }

  enum SubscribeToFeedType {
    GENERAL
    PROFILE
  }

  input SubscribeToFeedInput {
    profileId: ID!
    feedItemIds: [ID]!
    type: SubscribeToFeedType!
  }

  type SubscribeToFeedPayload {
    feedItem: FeedItem!
    event: FeedEvent
  }

  input SubscribeToNewFeedCountInput {
    lastFeedItemDate: DateTime!
  }

  type SubscribeToNewFeedCountPayload {
    count: Int!
    total: Int!
  }

  extend type Query {
    feedItemById(input: FeedItemByIdInput!): FeedItem!
    feedItemsByProfileId(input: FeedItemsByProfileIdInput!): FeedItemsPayload!
    profileFeedItems(input: ProfileFeedItemsInput!): FeedItemsPayload!
    feedItemComments(input: FeedItemCommentsInput!): FeedItemCommentsPayload!
    feedItemLikes(input: FeedItemLikesInput!): FeedItemLikesPayload!
    commentLikes(input: CommentLikesInput!): FeedItemLikesPayload!
    avatarUpdatedFeedItem(input: AvatarUpdatedFeedItemInput!): FeedItem
    commentById(input: CommentByIdInput!): PostComment!
    commentReplyById(input: CommentReplyByIdInput!): PostCommentReply!
  }

  extend type Mutation {
    createPost(input: CreatePostInput!): FeedItem!
    updatePost(input: UpdatePostInput!): FeedItem!
    deletePost(input: DeletePostInput!): DeletePostResponse!
    hidePostFromFeed(input: HidePostFromFeedInput!): HidePostFromFeedResponse!

    createCommentOnFeedItem(input: CreateCommentOnFeedItemInput!): PostComment!
    createReplyOnComment(input: CreateReplyOnCommentInput!): PostCommentReply!
    updateCommentOnFeedItem(input: UpdateCommentOnFeedItemInput!): PostComment!
    updateReplyOnComment(input: UpdateReplyOnCommentInput!): PostCommentReply!
    deleteCommentOnFeedItem(
      input: DeleteCommentOnFeedItemInput!
    ): DeleteCommentOnFeedItemResponse!
    deleteReplyOnComment(
      input: DeleteReplyOnCommentInput!
    ): DeleteReplyOnCommentResponse!

    createLikeOnComment(
      input: CreateLikeOnCommentInput!
    ): LikeOnCommentResponse!
    deleteLikeOnComment(
      input: DeleteLikeOnCommentInput!
    ): DeleteLikeOnCommentResponse!

    createLikeOnCommentReply(
      input: CreateLikeOnCommentReplyInput!
    ): LikeOnCommentReplyResponse!
    deleteLikeOnCommentReply(
      input: DeleteLikeOnCommentReplyInput!
    ): DeleteLikeOnCommentReplyResponse!

    createLikeOnFeedItem(
      input: CreateLikeOnFeedItemInput!
    ): CreateLikeOnFeedItemResponse!
    deleteLikeOnFeedItem(
      input: DeleteLikeOnFeedItemInput!
    ): DeleteLikeOnFeedItemResponse!
    shareFeedItem(input: ShareFeedItemInput!): FeedItem!
  }

  extend type Subscription {
    subscribeToFeed(input: SubscribeToFeedInput): SubscribeToFeedPayload!
    subscribeToNewFeedCount(
      input: SubscribeToNewFeedCountInput
    ): SubscribeToNewFeedCountPayload!
  }
`
