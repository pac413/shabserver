import { withFilter } from 'graphql-subscriptions'
import { isActionBlocked } from 'Connectors/blocking'
import {
  unviewedMessageNotificationTotal,
  unviewedNonMessageNotificationTotal,
} from 'Connectors/notification'
import { messageNotificationTypes } from 'Models/notification'
import pubsub, { PUBLISH } from 'Subscriptions'

export default {
  subscribeToMessageNotifications: {
    resolve: async (
      { subscribeToNotifications: { notification } },
      args,
      context
    ) => {
      const { unviewedTotal } = await unviewedMessageNotificationTotal(
        null,
        context
      )

      return { notification, unviewedTotal }
    },
    subscribe: withFilter(
      (args) => pubsub.asyncIterator(PUBLISH.NOTIFICATION),
      async (
        { subscribeToNotifications: { notification } },
        args,
        { activeProfileId }
      ) => {
        if (notification.profile !== activeProfileId) {
          return false
        }
        const isActionBlocking = await isActionBlocked(
          activeProfileId,
          notification.triggeredBy
        )
        return (
          !isActionBlocking &&
          messageNotificationTypes.includes(notification.type)
        )
      }
    ),
  },
  subscribeToNonMessageNotifications: {
    resolve: async (
      { subscribeToNotifications: { notification } },
      args,
      context
    ) => {
      const { unviewedTotal } = await unviewedNonMessageNotificationTotal(
        null,
        context
      )

      return { notification, unviewedTotal }
    },
    subscribe: withFilter(
      (args) => pubsub.asyncIterator(PUBLISH.NOTIFICATION),
      async (
        { subscribeToNotifications: { notification } },
        args,
        { activeProfileId }
      ) => {
        if (notification.profile !== activeProfileId) {
          return false
        }
        const isActionBlocking = await isActionBlocked(
          activeProfileId,
          notification.triggeredBy
        )
        return (
          !isActionBlocking &&
          !messageNotificationTypes.includes(notification.type)
        )
      }
    ),
  },
}
