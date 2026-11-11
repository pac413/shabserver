import { gql } from 'apollo-server-express'

export default gql`
  input AdminRecentMembersInput {
    limit: Int!
    offset: Int!
    filter: AdminRecentMembersFilterInput
  }

  enum AdminRecentMembersFilterInputType {
    all
    active
    reported
    deleted
    suspended
    incomplete
    highrisk
    restricted
    olami
  }

  input AdminRecentMembersFilterInput {
    handle: String
    q: String
    type: AdminRecentMembersFilterInputType = all
  }

  input AdminMemberRecentMessagesInput {
    profileId: String!
    limit: Int!
  }

  type Report {
    id: ID!
    reason: String!
    additionalDetails: String
    reporter: Profile!
    reportedUser: Profile!
    createdAt: DateTime
  }

  type AdminTotalsPayload {
    totalActiveLastSixMonths: Int!
    totalActiveLastYear: Int!
    totalActiveSinceCovid: Int!
    totalUsers: Int!
  }

  type AdminRecentMemberData {
    profile: Profile
    reports: [Report!]!
    totalMessages: Int
  }

  type AdminMemberRecentMessagesPayload {
    messages: [Message!]!
    total: Int!
  }

  input AdminDeleteAvatarInput {
    profileId: String!
  }

  union AdminDeleteAvatarPayload = Profile | Error

  extend type Query {
    adminRecentMembers(input: AdminRecentMembersInput!): ProfilesPayload
    adminRecentMemberData(profileId: String!): AdminRecentMemberData
    adminTotals: AdminTotalsPayload
    adminMemberRecentMessages(
      input: AdminMemberRecentMessagesInput!
    ): AdminMemberRecentMessagesPayload!
  }

  extend type Mutation {
    adminDeleteAvatar(input: AdminDeleteAvatarInput!): AdminDeleteAvatarPayload!
  }
`
