import { gql } from 'apollo-server-express'

export default gql`
  enum EndorsementSiteRole {
    HOST
    GUEST
    DATING
  }

  type Endorsement {
    id: ID!
    endorser: SimpleProfile!
    body: String
    date: DateTime
  }

  input GetEndorseInput {
    id: ID!
  }

  input EndorseHostReferenceInput {
    hostingId: String!
  }

  input EndorseGuestReferenceInput {
    hostingId: String!
  }

  input EndorseHostInput {
    profileId: ID!
    body: String!
    reference: EndorseHostReferenceInput
    endorsingBack: Boolean
  }

  input EndorseGuestInput {
    profileId: ID!
    body: String!
    reference: EndorseGuestReferenceInput
    endorsingBack: Boolean
  }

  input MultipleGuestsEndorsement {
    profileId: ID!
    body: String!
  }

  input EndorseMultipleGuestsInput {
    multipleEndorsements: [MultipleGuestsEndorsement]!
  }

  input EndorseDatingProspectInput {
    profileId: ID!
    body: String!
    endorsingBack: Boolean
  }

  type EndorsePayload {
    endorsement: Endorsement
  }

  type EndorseMultipleGuestsPayload {
    endorsements: [Endorsement]
  }

  input DeleteEndorsementInput {
    id: ID!
  }

  type DeleteEndorsementPayload {
    errors: [Error]
    deleted: Boolean
  }

  input UpdateEndorsementInput {
    id: ID!
    body: String
  }

  type UpdateEndorsementPayload {
    errors: [Error]
    endorsement: Endorsement
  }

  input EndorsementsInput {
    profileId: ID!
    onSiteRole: EndorsementSiteRole
    offset: Int
    limit: Int!
  }

  type EndorsementsEdges {
    nodes: [Endorsement!]!
    profileId: ID!
    offset: Int!
    limit: Int!
  }

  type EndorsementsResult {
    edges: EndorsementsEdges!
    total: Int!
  }

  extend type Query {
    endorsement(input: GetEndorseInput!): EndorsePayload!
    endorsements(input: EndorsementsInput!): EndorsementsResult!
  }

  extend type Mutation {
    endorseHost(input: EndorseHostInput!): EndorsePayload!
    endorseGuest(input: EndorseGuestInput!): EndorsePayload!
    endorseMultipleGuests(
      input: EndorseMultipleGuestsInput!
    ): EndorseMultipleGuestsPayload!
    endorseDatingProspect(input: EndorseDatingProspectInput!): EndorsePayload!
    deleteEndorsement(input: DeleteEndorsementInput!): DeleteEndorsementPayload!
    updateEndorsement(input: UpdateEndorsementInput!): UpdateEndorsementPayload!
  }
`
