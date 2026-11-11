import { gql } from 'apollo-server-express'

export default gql`
  type GuestProfileEndorsements {
    endorsements: [Endorsement]!
    total: Int!
  }

  type GuestProfile {
    id: ID!
    status: GuestProfileStatus
    availabilitySentence: String
    location: Location
    endorsements: [Endorsement]!
      @deprecated(reason: "use guestEndorsements field & endorsements query")
    guestEndorsements: GuestProfileEndorsements!
    references(input: ReferencesInput): [Reference]
  }

  input UpdateGuestProfileInput {
    profileId: ID!
    status: GuestProfileStatus
  }

  type UpdateGuestProfilePayload {
    errors: [Error]
    guestProfile: GuestProfile
  }

  extend type Mutation {
    updateGuestProfile(
      input: UpdateGuestProfileInput!
    ): UpdateGuestProfilePayload
  }
`
