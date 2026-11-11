import { gql } from 'apollo-server-express'

export default gql`
  type NotificationAction {
    name: String!
    label: String!
    style: NotificationActionStyle!
    type: NotificationActionType!
    payload: Object
    actionUrl: String
  }

  type NotificationLink {
    title: String!
    href: String!
    # optional params to help a non-web apps identify corresponding page
    resource: String
    id: String
  }

  type NotificationRawContent {
    text: String!
    links: [NotificationLink]
  }

  type Notification {
    id: String!
    triggeredBy: SimpleProfile!
    type: NotificationType!
    title: String!
    content: String!
    rawContent: NotificationRawContent!
    status: NotificationStatus!
    actions: [NotificationAction]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  input NotificationsInput {
    types: [NotificationType!]
    includeDismissed: Boolean
    # pagination
    limit: Int!
    offset: Int!
  }

  type NotificationsPayload {
    total: Int!
    unviewedTotal: Int!
    notifications: [Notification]!
  }

  type UnviewedNotificationsTotalPayload {
    unviewedTotal: Int!
  }

  input UpdateNotificationStatusInput {
    notificationId: String!
    status: NotificationStatus!
  }

  type SubscribeToNotificationsPayload {
    notification: Notification!
    unviewedTotal: Int!
  }

  extend type Query {
    notifications(input: NotificationsInput!): NotificationsPayload!
    nonMessageNotifications(input: NotificationsInput!): NotificationsPayload!
    messageNotifications(input: NotificationsInput!): NotificationsPayload!
    unviewedNotificationsTotal: UnviewedNotificationsTotalPayload!
    unviewedNonMessageNotificationTotal: UnviewedNotificationsTotalPayload!
    unviewedMessageNotificationTotal: UnviewedNotificationsTotalPayload!
  }

  extend type Mutation {
    updateNotificationStatus(
      input: UpdateNotificationStatusInput!
    ): Notification!
  }

  extend type Subscription {
    subscribeToMessageNotifications: SubscribeToNotificationsPayload!
    subscribeToNonMessageNotifications: SubscribeToNotificationsPayload!
  }
`
