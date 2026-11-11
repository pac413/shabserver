import { gql } from 'apollo-server-express'
import addressComponentSchema from 'graphql/schemas/addressComponent'
import autoTypeSearch from 'graphql/schemas/autoTypeSearch'
import blockingSchema from 'graphql/schemas/blocking'
import common from 'graphql/schemas/common'
import connectionsSchema from 'graphql/schemas/connections'
import conversationSchema from 'graphql/schemas/conversation'
import datingMatchSchema from 'graphql/schemas/datingMatch'
import datingProfileSchema from 'graphql/schemas/datingProfile'
import datingSearchSchema from 'graphql/schemas/datingSearch'
import datingAutoTypeSearchSchema from 'graphql/schemas/datingAutoTypeSearch'
import endorsementSchema from 'graphql/schemas/endorsement'
import enums from 'graphql/schemas/enums'
import errorSchema from 'graphql/schemas/error'
import featureFlagSchema from 'graphql/schemas/featureFlag'
import feedSchema from 'graphql/schemas/feed'
import flagSchema from 'graphql/schemas/flag'
import followerSchema from 'graphql/schemas/follower'
import friendsSchema from 'graphql/schemas/friends'
import guestProfileSchema from 'graphql/schemas/guestProfile'
import hostingSchema from 'graphql/schemas/hosting'
import hostAvailability from 'graphql/schemas/hostAvailability'
import hostProfileSchema from 'graphql/schemas/hostProfile'
import hostingDate from 'graphql/schemas/hostingDate'
import hostingMetrics from 'graphql/schemas/hostingMetrics'
import locationSchema from 'graphql/schemas/location'
import mediaSchema from 'graphql/schemas/media'
import messageSchema from 'graphql/schemas/message'
import notificationSchema from 'graphql/schemas/notification'
import occupationSchema from 'graphql/schemas/occupation'
import profileSchema from 'graphql/schemas/profile'
import preferenceSchema from 'graphql/schemas/preference'
import profileSettingsSchema from 'graphql/schemas/profileSettings'
import profileViewSchema from 'graphql/schemas/profileView.js'
import searchSchema from 'graphql/schemas/search'
import sponsoredPostSchema from 'graphql/schemas/sponsoredPost'
import referenceSchema from 'graphql/schemas/reference'
import userSchema from 'graphql/schemas/user'
import flaggedContentSchema from 'graphql/schemas/flaggedContent'
import adminSchema from 'graphql/schemas/admin'
import mutedConnection from 'graphql/schemas/mutedConnection'

const rootSchema = gql`
  scalar DateTime
  scalar Date
  scalar Object

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }
`

export default [
  ...common,
  addressComponentSchema,
  autoTypeSearch,
  blockingSchema,
  connectionsSchema,
  conversationSchema,
  datingMatchSchema,
  datingProfileSchema,
  datingSearchSchema,
  datingAutoTypeSearchSchema,
  endorsementSchema,
  enums,
  errorSchema,
  featureFlagSchema,
  feedSchema,
  flagSchema,
  followerSchema,
  friendsSchema,
  guestProfileSchema,
  hostProfileSchema,
  hostAvailability,
  hostingDate,
  hostingMetrics,
  hostingSchema,
  mediaSchema,
  messageSchema,
  notificationSchema,
  occupationSchema,
  profileSchema,
  preferenceSchema,
  profileViewSchema,
  profileSettingsSchema,
  locationSchema,
  searchSchema,
  sponsoredPostSchema,
  referenceSchema,
  rootSchema,
  userSchema,
  flaggedContentSchema,
  adminSchema,
  mutedConnection,
]
