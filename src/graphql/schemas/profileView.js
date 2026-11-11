import { gql } from 'apollo-server-express'

export default gql`
  type ProfileView {
    id: ID!
    viewer: SimpleProfile!
    lastVisited: DateTime!
  }

  input ProfileViewsInput {
    # pagination
    limit: Int!
    offset: Int!
    profileId: ID
  }

  type ProfileViewsPayload {
    profileViews: [ProfileView]
    total: Int!
  }

  extend type Query {
    profileViews(input: ProfileViewsInput!): ProfileViewsPayload!
  }
`
