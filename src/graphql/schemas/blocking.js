import { gql } from 'apollo-server-express'

export default gql`
  union BlockProfileResponse = Profile | Error
  union UnblockProfileResponse = Profile | Error

  extend type Query {
    blockingProfiles(profileId: ID): [SimpleProfile]!
  }

  extend type Mutation {
    blockProfile(profileId: ID!): Boolean!
    blockProfileV2(profileId: ID!): BlockProfileResponse!
    unblockProfile(profileId: ID!, onbehalf: ID): Boolean!
    unblockProfileV2(profileId: ID!, onbehalf: ID): UnblockProfileResponse!
  }
`
