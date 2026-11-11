import { gql } from 'apollo-server-express'

export default gql`
  type ProfileSettings {
    messagingPrivacy: MessagingPrivacyTier
    anonymousBrowsing: Boolean
    friendRequestNeeded: Boolean
    hideAllMedia: Boolean
    messagesByEmail: Boolean
    messagesByPush: Boolean
    invitesByEmail: Boolean
    invitesByPush: Boolean
    profileViewsByEmail: Boolean
    profileViewsByPush: Boolean
    newFriendsByEmail: Boolean
    newFriendsByPush: Boolean
    likesByEmail: Boolean
    likesByPush: Boolean
    commentsByEmail: Boolean
    commentsByPush: Boolean
    friendRequestByEmail: Boolean
    friendRequestByPush: Boolean
    weeklyActivitySummaryEmail: Boolean
    postPrivacy: PostPrivacySetting
    feedContent: FeedContentSetting
    paginatedSearchResult: Boolean
  }

  type ProfileSettingsPayload {
    profileId: String
    settings: ProfileSettings
  }

  input ProfileSettingsInput {
    profileId: ID
  }

  input updateProfileSettingsBooleansInput {
    profileId: String
    setting: BooleanProfileSetting
    value: Boolean
  }

  input updateProfileSettingsMessagingPrivacyTierInput {
    profileId: String
    value: MessagingPrivacyTier
  }

  input updateProfileSettingsPostPrivacyInput {
    profileId: String
    value: PostPrivacySetting
  }

  input updateProfileSettingsFeedContentInput {
    profileId: String
    value: FeedContentSetting
  }

  type updateProfileSettingsPayload {
    profileId: String
    settings: ProfileSettings
    message: String
  }

  extend type Query {
    profileSettings(input: ProfileSettingsInput): ProfileSettingsPayload
  }
  extend type Mutation {
    updateProfileSettingsBooleans(
      input: updateProfileSettingsBooleansInput!
    ): updateProfileSettingsPayload!
    updateProfileSettingsMessagingPrivacyTier(
      input: updateProfileSettingsMessagingPrivacyTierInput!
    ): updateProfileSettingsPayload!
    updateProfileSettingsPostPrivacy(
      input: updateProfileSettingsPostPrivacyInput!
    ): updateProfileSettingsPayload!
    updateProfileSettingsFeedContent(
      input: updateProfileSettingsFeedContentInput!
    ): updateProfileSettingsPayload!
  }
`
