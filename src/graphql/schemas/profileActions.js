import { gql } from 'apollo-server-express'

export default gql`
  type ProfileActions {
    message: Boolean
    invite: Boolean
    view: Boolean
  }
`
