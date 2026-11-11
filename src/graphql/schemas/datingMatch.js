import { gql } from 'apollo-server-express'

export default gql`
  type DatingMatch {
    id: ID!
    message: String
    party: MatchParty!
  }

  input CreateDatingMatchInput {
    guy: ID!
    girl: ID!
    message: String!
    party: MatchParty!
  }

  type DatingMatchPayload {
    datingMatch: DatingMatch
  }

  extend type Mutation {
    createDatingMatch(input: CreateDatingMatchInput!): DatingMatchPayload!
  }
`
