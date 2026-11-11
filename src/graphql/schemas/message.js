import { gql } from 'apollo-server-express'

export default gql`
  type MessageReaction {
    id: ID!
    reaction: String!
    messageId: ID!
    reactedBy: SimpleProfile!
    date: DateTime!
  }

  type Message {
    id: ID!
    text: String
    conversation: Conversation!
    sender: SimpleProfile!
    status: MessageStatusDetails!
    """
    If this message was sent through broadcast conversation by initiator, true
    Else, false
    """
    isBroadcastMessage: Boolean!
    date: DateTime!
    attachments: [Media!]!
    type: MessageType
    webScraped: WebScrapedBasic
    reactions: [MessageReaction!]!
  }

  type MessageStatusDetails {
    status: MessageStatus!
    dateSent: DateTime!
    dateRead: DateTime
  }

  input CreateMessageInput {
    conversationId: ID!
    text: String
    attachmentsIds: [ID]
    type: MessageType
    webScraped: WebScrapedBasicInput
  }

  type CreateMessagePayload {
    message: Message!
  }

  input DeleteMessageInput {
    messageId: ID!
  }

  input CreateMessageReactionInput {
    conversationId: ID!
    messageId: ID!
    reaction: String!
  }

  type CreateMessageReactionFailure {
    code: ID!
    message: String!
  }

  union CreateMessageReactionPayload =
      MessageReaction
    | CreateMessageReactionFailure

  input DeleteMessageReactionInput {
    id: ID!
    messageId: ID!
  }

  type DeleteMessageReactionSuccess {
    id: ID!
    messageId: ID!
  }

  type DeleteMessageReactionFailure {
    code: ID!
    message: String!
  }

  union DeleteMessageReactionPayload =
      DeleteMessageReactionSuccess
    | DeleteMessageReactionFailure

  type DeleteMessagePayload {
    deleted: Boolean!
  }

  input UpdateMessageReactionInput {
    id: ID!
    messageId: ID!
    reaction: String!
  }

  type UpdateMessageReactionFailure {
    code: ID!
    message: String!
  }

  union UpdateMessageReactionPayload =
      MessageReaction
    | UpdateMessageReactionFailure

  input MessagesInput {
    conversationId: ID!
    # pagination
    limit: Int!
    offset: Int!
  }

  type MessagesPayload {
    total: Int!
    messages: [Message!]!
  }

  input ReadMessagesInput {
    conversationId: ID!
  }

  type ReadMessagesPayload {
    messages: [Message!]
  }

  input SubscribeToMessagesInput {
    conversationId: ID!
  }

  type SubscribeToMessagesPayload {
    message: Message!
  }

  extend type Query {
    messages(input: MessagesInput!): MessagesPayload!
  }

  extend type Mutation {
    createMessage(input: CreateMessageInput!): CreateMessagePayload!
    readMessages(input: ReadMessagesInput!): ReadMessagesPayload!
    deleteMessage(input: DeleteMessageInput!): DeleteMessagePayload!
    createMessageReaction(
      input: CreateMessageReactionInput!
    ): CreateMessageReactionPayload!
    deleteMessageReaction(
      input: DeleteMessageReactionInput!
    ): DeleteMessageReactionPayload!
    updateMessageReaction(
      input: UpdateMessageReactionInput!
    ): UpdateMessageReactionPayload!
  }

  extend type Subscription {
    subscribeToMessages(
      input: SubscribeToMessagesInput
    ): SubscribeToMessagesPayload!
  }
`
