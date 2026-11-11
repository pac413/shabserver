import { gql } from 'apollo-server-express'

export default gql`
  type OperationPayload {
    status: Boolean
    error: String
  }
`
