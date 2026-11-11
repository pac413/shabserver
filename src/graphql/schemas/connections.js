import { gql } from 'apollo-server-express'

export default gql`
  input ConnectionsInput {
    targetProfileId: ID
  }

  type ConnectionsPayload {
    friendIds: [String]!
    followerIds: [String]!
    followingIds: [String]!
  }

  extend type Query {
    getAllConnections(input: ConnectionsInput): ConnectionsPayload
  }
`
