import { gql } from 'apollo-server-express'

export default gql`
  type HostProfileEndorsements {
    endorsements: [Endorsement]!
    total: Int!
  }

  type HostProfile {
    id: ID!
    status: HostProfileStatus
    canHostMeals: Boolean
    canHostSleep: Boolean
    reserveBy: HostReserveBy
    availabilitySentence: String
    location: Location
    privateInviteEnabled: Boolean
    privateInviteCode: String
    details: HostProfileDetails
    endorsements: [Endorsement]!
      @deprecated(reason: "use hostEndorsements field & endorsements query")
    hostEndorsements: HostProfileEndorsements!
    references(input: ReferencesInput): [Reference]
    mealAmount: Int
    sleepAmount: Int
    hostMen: Boolean
    hostWomen: Boolean
    hostFamiliesWithChildren: Boolean
    hostAffiliatedJews: Boolean
    hostUnAffiliatedJews: Boolean
    showGuestList: Boolean
    activeDates: [Date]
    unavailableGuests: [SimpleProfile]!
  }

  type HostProfileDetails {
    guestMealsAmount: Int
    guestSleepAmount: Int
    hostMen: Boolean
    hostWomen: Boolean
    hostFamiliesWithChildren: Boolean
    hostAffiliatedJews: Boolean
    hostUnAffiliatedJews: Boolean
  }

  input MyHostProfileInput {
    hostingDate: Date
  }
  type MyHostProfilePayload {
    hostProfile: HostProfile
  }
  input UpdateHostProfileInput {
    profileId: ID!
    """
    if hostingDate is empty the default host profile will be updated
    """
    hostingDate: Date
    status: HostProfileStatus
    reserveBy: HostReserveBy
    mealAmount: Int
    sleepAmount: Int
    hostMen: Boolean
    hostWomen: Boolean
    hostFamiliesWithChildren: Boolean
    hostAffiliatedJews: Boolean
    hostUnAffiliatedJews: Boolean
    showGuestList: Boolean
    privateInviteEnabled: Boolean
    privateInviteCode: String
    unavailableGuests: [String]
  }

  type UpdateHostProfilePayload {
    errors: [Error]
    hostProfile: HostProfile
  }

  input RegeneratePrivateInviteCodeInput {
    profileId: ID!
  }

  type RegeneratePrivateInviteCodePayload {
    errors: [Error]
    privateInviteCode: String
  }

  input VerifyPrivateInviteCodeInput {
    profileId: ID!
    privateInviteCode: String!
  }

  type VerifyPrivateInviteCodePayload {
    errors: [Error]
    isValid: Boolean
  }

  extend type Query {
    myHostProfile(input: MyHostProfileInput!): MyHostProfilePayload!
  }
  extend type Mutation {
    updateHostProfile(input: UpdateHostProfileInput!): UpdateHostProfilePayload!
    regeneratePrivateInviteCode(
      input: RegeneratePrivateInviteCodeInput!
    ): RegeneratePrivateInviteCodePayload!
    verifyPrivateInviteCode(
      input: VerifyPrivateInviteCodeInput!
    ): VerifyPrivateInviteCodePayload!
  }
`
