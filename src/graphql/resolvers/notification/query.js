import {
  getNotifications,
  getNonMessageNotifications,
  getMessageNotifications,
  unviewedNotificationsTotal,
  unviewedNonMessageNotificationTotal,
  unviewedMessageNotificationTotal,
} from 'Connectors/notification'

export default {
  notifications: async (_, { input }, context) => {
    const result = await getNotifications(input, context)
    return result
  },
  nonMessageNotifications: async (_, { input }, context) => {
    const result = await getNonMessageNotifications(input, context)
    return result
  },
  messageNotifications: async (_, { input }, context) => {
    const result = await getMessageNotifications(input, context)
    return result
  },
  unviewedNotificationsTotal: async (_, { input }, context) => {
    const result = await unviewedNotificationsTotal(input, context)
    return result
  },
  unviewedNonMessageNotificationTotal: async (_, { input }, context) => {
    const result = await unviewedNonMessageNotificationTotal(input, context)
    return result
  },
  unviewedMessageNotificationTotal: async (_, { input }, context) => {
    const result = await unviewedMessageNotificationTotal(input, context)
    return result
  },
}
