import { gql } from 'apollo-server-express'

export default gql`
  type Occupation {
    id: ID!
    name: String
  }

  extend type Query {
    occupations(lang: Language!): [Occupation]
  }
`
