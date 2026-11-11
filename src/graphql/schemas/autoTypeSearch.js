import { gql } from 'apollo-server-express'

export default gql`
  enum AutoTypeSearchBy {
    all
    profiles
    occupations
  }

  input AutoTypeSearchInput {
    keyword: String!
    language: Language!
    searchBy: AutoTypeSearchBy!
    limit: Int!
    searchFor: SearchFor = all
  }

  type AutoTypeSearchPayload {
    profiles: [SimpleProfile]!
    occupations: [Occupation]!
  }

  extend type Query {
    autoTypeSearch(input: AutoTypeSearchInput!): AutoTypeSearchPayload!
  }
`
