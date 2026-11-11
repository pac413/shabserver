import { GraphQLDate, GraphQLDateTime } from 'graphql-iso-date'
import addressComponentResolvers from 'graphql/resolvers/addressComponent'
import autoTypeSearchResolvers from 'graphql/resolvers/autoTypeSearch'
import blockingResolvers from 'graphql/resolvers/blocking'
import connectionsResolvers from 'graphql/resolvers/connections'
import conversationResolvers from 'graphql/resolvers/conversation'
import datingMatchResolvers from 'graphql/resolvers/datingMatch'
import datingProfileResolvers from 'graphql/resolvers/datingProfile'
import datingSearchResolvers from 'graphql/resolvers/datingSearch'
import datingAutoTypeSearchResolvers from 'graphql/resolvers/datingAutoTypeSearch'
import endorsement from 'graphql/resolvers/endorsement'
import enums from 'graphql/resolvers/enums'
import featureFlagResolvers from 'graphql/resolvers/featureFlag'
import feedResolvers from 'graphql/resolvers/feed'
import followerResolvers from 'graphql/resolvers/follower'
import friendsResolvers from 'graphql/resolvers/friends'
import guestProfile from 'graphql/resolvers/guestProfile'
import hostAvailability from 'graphql/resolvers/hostAvailability'
import hostingDate from 'graphql/resolvers/hostingDate'
import hostingResolvers from 'graphql/resolvers/hosting'
import hostingMetrics from 'graphql/resolvers/hostingMetrics'
import hostProfile from 'graphql/resolvers/hostProfile'
import messageResolvers from 'graphql/resolvers/message'
import notificationResolvers from 'graphql/resolvers/notification'
import occupationResolvers from 'graphql/resolvers/occupation'
import profileSettingsResolvers from 'graphql/resolvers/profileSettings'
import profileResolvers from 'graphql/resolvers/profile'
import preferenceResolvers from 'graphql/resolvers/preference'
import profileViewResolvers from 'graphql/resolvers/profileView'
import searchResolvers from 'graphql/resolvers/search'
import referenceResolvers from 'graphql/resolvers/reference'
import userResolvers from 'graphql/resolvers/user'
import mediaResolovers from 'graphql/resolvers/media'
import avatarResolvers from 'graphql/resolvers/media/avatar'
import wallpaperResolvers from 'graphql/resolvers/media/wallpaper'
import pictureResolvers from 'graphql/resolvers/media/picture'
import flaggedContentResolvers from 'graphql/resolvers/flaggedContent'
import adminResolvers from 'graphql/resolvers/admin'
import mutedConnection from 'graphql/resolvers/mutedConnection'

const customScalarResolver = {
  Date: GraphQLDate,
  DateTime: GraphQLDateTime,
}

export default [
  addressComponentResolvers,
  autoTypeSearchResolvers,
  blockingResolvers,
  connectionsResolvers,
  conversationResolvers,
  customScalarResolver,
  datingMatchResolvers,
  datingProfileResolvers,
  datingSearchResolvers,
  datingAutoTypeSearchResolvers,
  endorsement,
  enums,
  featureFlagResolvers,
  feedResolvers,
  followerResolvers,
  friendsResolvers,
  guestProfile,
  hostAvailability,
  hostingDate,
  hostingMetrics,
  hostingResolvers,
  hostProfile,
  messageResolvers,
  notificationResolvers,
  occupationResolvers,
  profileSettingsResolvers,
  profileResolvers,
  preferenceResolvers,
  profileViewResolvers,
  searchResolvers,
  referenceResolvers,
  userResolvers,
  mediaResolovers,
  avatarResolvers,
  wallpaperResolvers,
  pictureResolvers,
  flaggedContentResolvers,
  adminResolvers,
  mutedConnection,
]
