import { gql } from 'apollo-server-express'

export default gql`
  type FlaggedContent {
    id: ID!
    type: FlaggedContentType!
    reason: String!
    resourceId: String!
    reportedBy: Profile!
    ownedBy: Profile!
    createdAt: DateTime!
  }

  input FlaggedContentsInput {
    limit: Int = 10
    offset: Int = 10
  }

  type FlaggedContentsPayload {
    contents: [FlaggedContent!]!
    total: Int!
  }

  input FlagContentInput {
    resourceId: String!
    type: FlaggedContentType!
    reason: String!
  }

  input UnflagContentInput {
    id: ID!
  }

  input FlaggedContentsByProfileInput {
    profileId: ID!
  }

  extend type Query {
    flaggedContents(input: FlaggedContentsInput!): FlaggedContentsPayload
    flaggedContentsByProfile(
      input: FlaggedContentsByProfileInput!
    ): FlaggedContentsPayload
  }

  extend type Mutation {
    flagContent(input: FlagContentInput!): Boolean!
    unflagContent(input: UnflagContentInput!): Boolean!
  }
`
