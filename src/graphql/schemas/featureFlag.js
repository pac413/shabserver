import { gql } from 'apollo-server-express'

export default gql`
  type FeatureFlags {
    postViewEnabled: Boolean!
    broadcastMessaingEnabled: Boolean!
  }

  extend type Query {
    globalFeatureFlags: FeatureFlags!
    featureFlags: FeatureFlags!
  }
`
