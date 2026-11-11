import * as Sentry from '@sentry/node'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { getTranslatedText, getRawContent } from 'Utils/i18n'
import Query from './query'
import Mutation from './mutation'
import Subscription from './subscription'

export default {
  Query,
  Mutation,
  Subscription,
  Notification: {
    id: (parent) => parent.id || parent._id,
    triggeredBy: async (parent, _, context) => {
      const profile = await simpleProfileLoader.load(parent.triggeredBy)
      if (!profile) {
        console.error('INVALID_NOTIFICATION_TRIGGERED_BY', { parent, context })
        Sentry.captureException(
          new Error('INVALID_NOTIFICATION_TRIGGERED_BY', { parent, context })
        )
      }
      return profile
    },
    title: (parent, _, { locale }) => getTranslatedText(parent.title, locale),
    content: (parent, _, { locale }) =>
      getTranslatedText(parent.content, locale),
    rawContent: (parent, _, { locale }) =>
      getRawContent(parent.content, locale),
    actions: (parent, _, { locale }) => {
      if (!parent.actions) {
        return []
      }
      return parent.actions.map((action) => ({
        name: action.name,
        label: getTranslatedText(action.label, locale),
        style: action.style,
        type: action.type,
        payload: action.payload,
        actionUrl: action.actionUrl,
      }))
    },
  },
}
