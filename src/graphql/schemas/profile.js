import { gql } from 'apollo-server-express'

export default gql`
  # Too big - we should add a type ActiveProfile
  type Profile {
    id: ID!
    firstName: String!
    lastName: String!
    displayName: String!
    handle: String!
    pictures: [Picture]!
    wallpaper: Wallpaper!
    profileUrl: String!

    # Active profile is blocked by this profile
    isBlocked: Boolean!
    # Active profile is blocking this profile
    isBlocking: Boolean!

    # Active profile is following this profile
    isFollowing: Boolean!

    email: String
    avatar: Avatar
    gender: Gender
    primaryLocation: Location
    phone: String
    title: Title
    birthday: DateTime
    occupation: String
    occupationId: String
    uncuratedOccupation: String
    organization: String
    religiousAffiliation: ReligiousAffiliation
    about: String
    isMarried: Boolean
    spouse: String
    children: Int
    roles: [String]
    siteRoles: [SiteRole]
    hostProfile: HostProfile
    datingProfile: DatingProfile
    guestProfile: GuestProfile
    dateActive: DateTime!
    createdAt: DateTime!
    searchPreference: Preference
    datingPreference: Preference
    friendship: Friendship
    references(input: ReferencesInput): [Reference]
    flags: [Flag]
    totals: ProfileTotals
    restrictions: ProfileRestrictions
    accountStatus: String
    onesignalId: String
    riskAssessment: RiskAssessment
    isZealot: Boolean
    isGreenlight: Boolean
    isPushSupported: Boolean
    isAdmin: Boolean
    reportId: String
    lastReportedAt: DateTime
    loginMethods: [String]
    primaryLocale: Locale!
    olamiContactMe: Boolean
    profileSettings: ProfileSettings
  }

  type ProfileTotals {
    invites: Int
    views: Int
    connections: Int
  }

  type ProfileRestrictions {
    profileId: ID!
    messaging: Boolean
    feed: Boolean
    actions: Boolean
    search: Boolean
  }

  type RiskAssessment {
    ipAddress: String
    userAgent: String
    ipRiskScore: Float
    minFraudRiskScore: Float
    location: RiskAssessmentLocation
  }

  type RiskAssessmentLocation {
    city: String
    cityConfidence: Float
    country: String
    countryConfidence: Float
  }

  input UpdateProfileInput {
    id: ID
    firstName: String
    lastName: String
    displayName: String
    phone: String
    title: Title
    birthday: DateTime
    gender: Gender
    occupation: String
    occupationId: String
    organization: String
    primaryLocation: LocationInput
    religiousAffiliation: ReligiousAffiliation
    about: String
    isMarried: Boolean
    spouse: String
    children: Int
    datingAvailable: Boolean
    avatar: ID
    wallpaper: ID
    onesignalId: String
  }

  input ProfileInput {
    id: ID
    handle: String
    hostingDate: Date
  }

  input ProfilesInput {
    q: String
    hostingDate: Date
    limit: Int
  }

  input CompleteRegisterInput {
    siteRoles: [SiteRole]
    location: LocationInput
    religiousAffiliation: ReligiousAffiliation
    title: Title
    isMarried: Boolean
    birthday: DateTime
    occupationId: Int
    languageCode: String @deprecated(reason: "use primaryLocale")
    primaryLocale: Locale
    emailOptIn: Boolean
  }

  type ProfilesPayload {
    profiles: [Profile!]!
  }

  type ProfilePayload {
    errors: [Error]
    profile: Profile
  }

  type UpdateProfilePayload {
    errors: [Error]
    profile: Profile
  }

  type SiteRoleUpdatedPayload {
    error: Error
    profile: Profile
  }

  type CompleteRegisterPayload {
    profile: Profile
  }

  input PopularHostsInput {
    limit: Int
  }

  type PopularHostsPayload {
    profiles: [Profile]
  }

  input RecentGuestsInput {
    profileId: ID!
    limit: Int
  }

  type RecentGuestsPayload {
    profiles: [Profile]
  }
  input RecentHostsInput {
    profileId: ID!
    limit: Int
  }

  type RecentHostsPayload {
    profiles: [Profile]
  }

  input SuggestedProfilesInput {
    siteRole: SiteRole
    criteria: SuggestedProfilesCriteria
    limit: Int
  }

  type SuggestedProfilesPayload {
    profiles: [Profile]
  }

  input ProfileFriendRequestSettingInput {
    whoCanFriend: WhoCanFriendValues
  }

  input MergeProfiles {
    primaryProfileId: ID!
    secondaryProfileId: ID!
  }

  input SubscribeToSimpleProfilesInput {
    profileIds: [ID]!
  }

  input SubscribeToProfileInput {
    profileId: ID!
  }

  input DeleteProfilePictureInput {
    id: ID!
    removePost: Boolean!
  }

  type DeleteProfilePicturePayload {
    id: ID!
  }

  type ProfileContactDetails {
    phone: String
    email: String
    primaryLocation: Location
  }

  input ProfileContactDetailsInput {
    id: ID!
    hostingId: ID!
  }

  input RecentMembersInput {
    # up to 9 items
    limit: Int!
  }

  extend type Query {
    profile(input: ProfileInput): ProfilePayload
    profiles(input: ProfilesInput): ProfilesPayload
    popularHosts(input: PopularHostsInput): PopularHostsPayload
    recentGuests(input: RecentGuestsInput): RecentGuestsPayload
    recentHosts(input: RecentHostsInput): RecentHostsPayload
    suggestedProfiles(input: SuggestedProfilesInput): SuggestedProfilesPayload
    recentMembers(input: RecentMembersInput!): ProfilesPayload
  }

  extend type Mutation {
    completeRegister(input: CompleteRegisterInput!): CompleteRegisterPayload!
    resendConfirmationEmail: OperationPayload!
    updateProfile(input: UpdateProfileInput!): UpdateProfilePayload!
    updateProfilePrimaryLocale(primaryLocale: Locale!): Locale!
    addGuestSiteRole(input: ProfileInput!): SiteRoleUpdatedPayload!
    addHostSiteRole(input: ProfileInput!): SiteRoleUpdatedPayload!
    addDatingSiteRole(input: ProfileInput!): SiteRoleUpdatedPayload!
    deleteGuestSiteRole(input: ProfileInput!): SiteRoleUpdatedPayload!
    deleteHostSiteRole(input: ProfileInput!): SiteRoleUpdatedPayload!
    deleteDatingSiteRole(input: ProfileInput!): SiteRoleUpdatedPayload!
    deleteProfilePicture(
      input: DeleteProfilePictureInput!
    ): DeleteProfilePicturePayload!
    setProfileFriendRequestSetting(
      input: ProfileFriendRequestSettingInput!
    ): OperationPayload!
    mergeProfiles(input: MergeProfiles!): OperationPayload!
  }

  extend type Subscription {
    subscribeToSimpleProfiles(
      input: SubscribeToSimpleProfilesInput!
    ): SimpleProfile!
    subscribeToProfile(input: SubscribeToProfileInput!): Profile!
  }
`
