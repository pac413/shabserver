import { gql } from 'apollo-server-express'

export default gql`
  type HostingNote {
    sender: HostingRole!
    body: String!
    status: HostingStatus!
    date: DateTime!
  }

  type Hosting {
    id: ID!
    date: Date!
    host: SimpleProfile!
    guest: SimpleProfile!
    type: HostingType!
    sharedParts: [HostingPart!]!
    hostParts: [HostingPart!]!
    guestParts: [HostingPart!]!
    status: HostingStatus!
    notes: [HostingNote!]!
  }

  input hostingsInput {
    date: Date!
    """
    A member can be both a guest and host. When querying for hostings we must specify the role.
    For example, for a host wishing to see hosting he extended or request from guests, we will specify hostingRole as HOST.
    Conversely, for a guest wishing to see hosting he requested or invitations send to him from hosts, we will specify hostingRole as GUEST
    """
    role: HostingRole!
    statuses: [HostingStatus]
    parts: [HostingPart]
    types: [HostingType]
    profileId: ID
    limit: Int
    offset: Int
  }

  type hostingsPayload {
    hostings: [Hosting!]!
    total: Int!
    offset: Int
    limit: Int
  }

  type guestListVisibilityPayload {
    visible: Boolean!
  }

  input acceptHostingInput {
    id: ID!
    parts: [HostingPart]
    note: String
  }

  input declineHostingInput {
    id: ID!
    note: String
  }

  input requestHostingInput {
    host: ID!
    parts: [HostingPart]!
    date: Date!
    note: String!
    privateInviteCode: String
  }

  input extendHostingInput {
    guest: ID!
    parts: [HostingPart]!
    date: Date!
    note: String!
  }

  input bulkInvitationsInput {
    guests: [ID!]
    parts: [HostingPart]!
    date: Date!
    note: String!
  }

  input deleteHostingInput {
    id: ID!
  }

  input SendMessageToGuestsInput {
    hostingIds: [ID!]!
    message: String!
  }

  type requestHostingPayload {
    hosting: Hosting!
  }

  type extendHostingPayload {
    hosting: Hosting!
  }

  type deleteHostingPayload {
    hosting: Hosting!
  }

  type updateHostingPartPayload {
    hosting: Hosting!
  }

  type acceptHostingPayload {
    hosting: Hosting!
  }

  type declineHostingPayload {
    hosting: Hosting!
  }

  type bulkInvitationsPayload {
    hostings: [Hosting]
  }

  type SendMessageToGuestsSuccess {
    """
    Number of successful message
    """
    success: Int!
    """
    Number of failed message
    """
    failure: Int!
  }

  type SendMessageToGuestsFailure {
    """
    Message that indicates why the messaging failed.
    """
    message: String!
  }

  union SendMessageToGuestsPayload =
      SendMessageToGuestsSuccess
    | SendMessageToGuestsFailure

  extend type Query {
    Hostings(input: hostingsInput!): hostingsPayload!
    hostingById(id: ID!): Hosting
    guestListVisibility(profileId: ID!): guestListVisibilityPayload!
  }

  extend type Mutation {
    requestHosting(input: requestHostingInput!): requestHostingPayload!
    extendHosting(input: extendHostingInput!): extendHostingPayload!
    # not sure we should allow delete
    deleteHosting(input: deleteHostingInput!): deleteHostingPayload!
    acceptHosting(input: acceptHostingInput!): acceptHostingPayload!
    declineHosting(input: declineHostingInput!): declineHostingPayload!
    bulkInvitations(input: bulkInvitationsInput!): bulkInvitationsPayload!
    sendMessageToGuests(
      input: SendMessageToGuestsInput!
    ): SendMessageToGuestsPayload!
    #
    # To discuss
    #
    # rescheduleHosting()
    #
    # confirmHosting()
    #   host will have an option to confirm hosting. Like this after the
    #   details were finalized via the messaging tool the host will update the
    #   hosting and confirm.
  }
`
