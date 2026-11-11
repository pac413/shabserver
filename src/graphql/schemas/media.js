import { gql } from 'apollo-server-express'

export default gql`
  type Avatar {
    id: ID!
    originalMediaId: ID
    small: String
    medium: String
    large: String
    original: String
  }

  type Wallpaper {
    id: ID!
    originalMediaId: ID
    original: String
    isPlaceholder: Boolean
  }

  type Picture {
    id: ID!
    originalMediaId: ID
    medium: String
    large: String
    original: String
  }

  type Video {
    id: ID!
    thumbnails: VideoThumbnails
    original: String
    trailer: String
    low: String
    meta: MediaMeta
  }

  type VideoThumbnails {
    small: String!
    medium: String!
    large: String!
  }

  type MediaThumbnail {
    name: String!
    url: String!
  }

  type VideoQuality {
    name: String!
    url: String!
  }

  type MediaMeta {
    width: Int
    height: Int
    size: Float
    orientation: VideoOrientation
    duration: Float
  }

  type Media {
    id: ID!
    mediaType: MediaType!
    mediaSubType: MediaSubType!
    originalMediaId: ID
    originalFilename: String!
    mimetype: String!
    originalUrl: String!
    status: MediaStatus!
    thumbnails: [MediaThumbnail]!
    quality: [VideoQuality]!
    meta: MediaMeta!
  }

  input MediaUploadUrlInput {
    filename: String!
    mediaType: MediaType!
    mediaSubType: MediaSubType!
    mimetype: String
    profileId: ID
  }

  type MediaUploadUrlPayload {
    id: String!
    url: String!
  }

  # TODO: each field of media reference is optional, add more fields if needed
  input MediaReferenceInput {
    conversationId: ID
    originalMediaId: ID
    feedItemId: ID
    commentId: ID
    commentReplyId: ID
  }

  input ConfirmMediaUploadInput {
    id: String!
    filename: String!
    mediaType: MediaType!
    mediaSubType: MediaSubType!
    reference: MediaReferenceInput
    profileId: ID
    mimetype: String!
  }

  input MediaInput {
    id: ID!
  }

  type MediaPayload {
    errors: [Error]
    media: Media
  }

  input DeleteMediaInput {
    id: ID!
    keepOriginal: Boolean
  }

  type DeleteMediaPayload {
    errors: [Error]
    deleted: Boolean
  }

  # TODO: Add more inputs here whenever we need this mutation
  input UpdateMediaInput {
    id: ID!
    mediaType: MediaType
    mediaSubType: MediaSubType
  }

  extend type Query {
    getMedia(input: MediaInput!): MediaPayload!
  }

  extend type Mutation {
    deleteMedia(input: DeleteMediaInput!): DeleteMediaPayload!
    updateMedia(input: UpdateMediaInput!): MediaPayload!
    getMediaUploadUrl(input: MediaUploadUrlInput!): MediaUploadUrlPayload!
    confirmAndProcessUploadedMedia(input: ConfirmMediaUploadInput!): Media!
  }
`
