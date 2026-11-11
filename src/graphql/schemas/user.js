import { gql } from 'apollo-server-express'

export default gql`
  type User {
    id: ID!
    email: String!
    role: String
  }

  type AddSiteHostRolePayload {
    roles: [String]
  }

  type AddSiteGuestRolePayload {
    roles: [String]
  }

  input DeleteMyAccountInput {
    note: String
    reason: UserAccountDeleteReason
  }

  input RestoreMyAccountInput {
    note: String
  }
  type DeleteMyAccountPayload {
    success: Boolean
    errors: [Error]
  }

  type RestoreMyAccountPayload {
    success: Boolean
    errors: [Error]
  }

  input SuspendAccountInput {
    note: String
    reason: AdminAccountDeleteReason
    profileId: ID!
  }

  input UnsuspendAccountInput {
    profileId: ID!
    note: String
  }

  type SuspendAccountPayload {
    success: Boolean!
    profile: Profile
  }

  type UnsuspendAccountPayload {
    success: Boolean!
    profile: Profile
  }

  input RestrictionsInput {
    profileId: ID!
    messaging: Boolean
    feed: Boolean
    actions: Boolean
    search: Boolean
  }

  type ConfirmEmailPayload {
    success: Boolean
  }

  input UpdateAccountEmailInput {
    email: String!
  }

  type UpdateAccountEmailPayload {
    success: Boolean
    errors: [Error]
  }

  input UpdateAccountPasswordInput {
    password: String!
  }

  type UpdateAccountPasswordPayload {
    success: Boolean
    errors: [Error]
  }

  input AccountTouchIdInput {
    touchId: String!
  }

  type AccountTouchIdPayload {
    success: Boolean
    errors: [Error]
  }

  input ConfirmEmailInput {
    token: String
  }

  input ToggleAdminInput {
    profileId: ID!
    value: Boolean
  }

  input ToggleZealotInput {
    profileId: ID!
    value: Boolean
  }

  input ToggleGreenlightInput {
    profileId: ID!
    value: Boolean
  }

  input DeleteMemberInput {
    profileId: ID!
    suspend: Boolean
  }

  input BulkDeleteMembersInput {
    profileIds: [ID!]
    suspend: Boolean
  }

  input ReportMemberInput {
    profileId: ID!
    reason: String!
    additionalDetails: String
  }

  input UnreportMemberInput {
    profileId: ID!
  }

  type ToggleAdminPayload {
    success: Boolean!
    profile: Profile
  }

  type ToggleZealotPayload {
    success: Boolean!
    profile: Profile
  }

  type ToggleGreenlightPayload {
    success: Boolean!
    profile: Profile
  }

  type DeleteMemberPayload {
    success: Boolean!
    profile: Profile
  }

  type BulkDeleteMembersPayload {
    success: Boolean!
    profiles: [Profile!]!
  }

  type ReportMemberPayload {
    success: Boolean!
    profile: Profile
  }

  type UnreportMemberPayload {
    success: Boolean!
    profile: Profile
  }

  extend type Query {
    users: [User!]
    user(id: ID!): User
  }

  extend type Mutation {
    updateAccountEmail(
      input: UpdateAccountEmailInput!
    ): UpdateAccountEmailPayload!
    updateAccountPassword(
      input: UpdateAccountPasswordInput!
    ): UpdateAccountPasswordPayload!
    updateAccountTouchId(input: AccountTouchIdInput!): AccountTouchIdPayload!
    verifyAccountTouchId(input: AccountTouchIdInput): AccountTouchIdPayload!
    addSiteHostRole: AddSiteHostRolePayload
    addSiteGuestRole: AddSiteGuestRolePayload
    confirmEmail(input: ConfirmEmailInput): ConfirmEmailPayload
    deleteMyAccount(input: DeleteMyAccountInput!): DeleteMyAccountPayload!
    restoreMyAccount(input: RestoreMyAccountInput!): RestoreMyAccountPayload!
    suspendAccount(input: SuspendAccountInput!): SuspendAccountPayload!
    unsuspendAccount(input: UnsuspendAccountInput!): UnsuspendAccountPayload!
    setRestrictions(input: RestrictionsInput!): ProfileRestrictions!
    toggleAdmin(input: ToggleAdminInput!): ToggleAdminPayload!
    toggleZealot(input: ToggleZealotInput!): ToggleZealotPayload!
    toggleGreenlight(input: ToggleGreenlightInput!): ToggleGreenlightPayload!
    deleteMember(input: DeleteMemberInput!): DeleteMemberPayload!
    bulkDeleteMembers(input: BulkDeleteMembersInput!): BulkDeleteMembersPayload!
    reportMember(input: ReportMemberInput!): ReportMemberPayload!
    unreportMember(input: UnreportMemberInput!): UnreportMemberPayload!
  }
`
