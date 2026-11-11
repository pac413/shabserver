import { gql } from 'apollo-server-express'

export default gql`
  type Flag {
    code: FlagCode
    scopes: [FlagScope]
  }
`
