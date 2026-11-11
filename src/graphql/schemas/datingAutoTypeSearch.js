import { gql } from 'apollo-server-express'

export default gql`
  input DatingAutoTypeSearchInput {
    keyword: String!
    menOnly: Boolean
    womenOnly: Boolean
    limit: Int!
  }

  extend type Query {
    datingAutoTypeSearch(input: DatingAutoTypeSearchInput!): ProfilesPayload
  }
`
