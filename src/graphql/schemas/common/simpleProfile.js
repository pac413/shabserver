import { gql } from 'apollo-server-express'

export default gql`
  type SimpleProfile {
    id: ID!
    avatar: Avatar
    firstName: String!
    lastName: String!
    displayName: String!
    email: String
    phone: String
    profileUrl: String!
    handle: String!
    isBlocked: Boolean!
    isBlocking: Boolean!
    isFollowing: Boolean
    occupation: String
    uncuratedOccupation: String
    about: String
    primaryLocation: Location
    siteRoles: [SiteRole]
    friendship: Friendship
  }
`
