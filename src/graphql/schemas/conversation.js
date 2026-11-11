import { gql } from 'apollo-server-express'

export default gql`
  type Conversation {
    id: ID!
    participants: [ConversationParticipant!]!
    initiator: SimpleProfile
    title: String
    isBroadcast: Boolean!
    lastMessage: Message
    unreadMessagesCount: Int!
    lastActive: String!
    updatedAt: String!
  }

  type ConversationParticipant {
    profile: SimpleProfile!
    status: ConversationParticipantStatus!
  }

  input ConversationsQueryInput {
    search: String
    # pagination
    limit: Int!
    offset: Int!
  }

  input PendingConversationsQueryInput {
    limit: Int!
    offset: Int!
  }

  type ConversationsPayload {
    total: Int!
    conversations: [Conversation]!
  }

  input ConversationQueryInput {
    id: ID!
  }

  extend type Query {
    conversations(input: ConversationsQueryInput!): ConversationsPayload!
    conversation(input: ConversationQueryInput!): Conversation!
    pendingConversations(
      input: PendingConversationsQueryInput
    ): ConversationsPayload!
  }

  input ApproveConversationInput {
    conversationId: ID!
  }

  input RejectConversationInput {
    conversationId: ID!
  }

  input ArchiveConversationInput {
    conversationId: ID!
  }
  type ArchiveConversationPayload {
    archived: ID
  }

  input CreateConversationInput {
    participants: [ID]!
  }

  input UserIsTypingInput {
    conversationId: ID!
    mediaType: MediaType
  }

  input CreateBroadcastConversationInput {
    """
    This title is used to show to all the participants
    about the topic of this broadcast conversation.
    """
    title: String!
    participantHandles: [ID!]!
  }

  extend type Mutation {
    createBroadcastConversation(
      input: CreateBroadcastConversationInput!
    ): Conversation!
    createConversation(input: CreateConversationInput!): Conversation!
    approveConversation(input: ApproveConversationInput!): Conversation!
    rejectConversation(input: RejectConversationInput!): Conversation!
    archiveConversation(
      input: ArchiveConversationInput!
    ): ArchiveConversationPayload!
    userIsTyping(input: UserIsTypingInput!): Boolean!
  }

  type SubscribeToConversationsPayload {
    conversation: Conversation!
  }
  type SubscribeToUserIsTypingPayload {
    conversationId: ID!
    mediaType: MediaType
    profileId: ID!
  }

  extend type Subscription {
    subscribeToConversations: SubscribeToConversationsPayload!
    subscribeToUserIsTyping: SubscribeToUserIsTypingPayload!
  }
`
