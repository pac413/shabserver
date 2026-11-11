import { gql } from 'apollo-server-express'

export default gql`
  input MuteConnectionInput {
    profileId: ID!
  }

  input MutedConnectionsInput {
    profileId: ID
    limit: Int = 10
    offset: Int = 0
  }

  type MutedConnectionsPayload {
    profiles: [Profile]
    total: Int!
  }

  extend type Query {
    # will be implemented in the next iteration
    mutedConections(input: MutedConnectionsInput!): MutedConnectionsPayload
  }

  extend type Mutation {
    muteConnection(input: MuteConnectionInput!): Boolean!
    unmuteConnection(input: MuteConnectionInput!): Boolean!
  }
`
