import { gql } from 'apollo-server-express'

export default gql`
  input FollowProfileInput {
    profileId: ID!
  }

  input FollowersInput {
    profileId: ID
    limit: Int = 10
    offset: Int = 10
  }

  type FollowersPayload {
    profiles: [Profile]
    total: Int!
  }

  type FollowersV2Payload {
    profiles: [SimpleProfile]
    total: Int!
  }

  input FollowingsInput {
    profileId: ID
    limit: Int = 10
    offset: Int = 10
  }

  type FollowingsPayload {
    profiles: [Profile]
    total: Int!
  }

  type FollowingsV2Payload {
    profiles: [SimpleProfile]
    total: Int!
  }

  union FollowProfileResponse = Profile | Error

  input UnfollowProfileInput {
    profileId: ID!
  }

  union UnfollowProfileResponse = Profile | Error

  extend type Query {
    isFollowingProfile(profileId: ID!): Boolean!
      @deprecated(reason: "Moved to \`Profile's isFollowing\`")
    followers(input: FollowersInput!): FollowersPayload
    followersV2(input: FollowersInput!): FollowersV2Payload
    followings(input: FollowingsInput!): FollowingsPayload
    followingsV2(input: FollowingsInput!): FollowingsV2Payload
  }

  extend type Mutation {
    followProfile(input: FollowProfileInput!): Boolean!
    followProfileV2(input: FollowProfileInput!): FollowProfileResponse!
    unfollowProfile(input: FollowProfileInput!): Boolean!
    unfollowProfileV2(input: UnfollowProfileInput!): UnfollowProfileResponse!
  }
`
