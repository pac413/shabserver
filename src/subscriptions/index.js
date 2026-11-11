import { RedisPubSub } from 'graphql-redis-subscriptions'
import Redis from 'ioredis'
import * as CONVERSATION_EVENTS from './conversation'
import * as POST_EVENTS from './post'
import * as MESSAGE_EVENTS from './messages'
import * as NOTIFICATION_EVENTS from './notification'
import * as PROFILE_EVENTS from './profile'

export const EVENTS = {
  CONVERSATION: CONVERSATION_EVENTS,
  POST: POST_EVENTS,
  MESSAGE: MESSAGE_EVENTS,
  NOTIFICATION: NOTIFICATION_EVENTS,
  PROFILE: PROFILE_EVENTS,
}

const options = {
  host: process.env.REDIS_SERVER,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  showFriendlyErrorStack: true,
  retryStrategy: (times) => {
    // reconnect after
    return Math.min(times * 50, 2000)
  },
}

const pubsub = new RedisPubSub({
  publisher: new Redis(options),
  subscriber: new Redis(options),
})

export const PUBLISH = {
  CONVERSATION: 'CONVERSATION',
  POST: 'POST',
  MESSAGE: 'MESSAGE',
  NOTIFICATION: 'NOTIFICATION',
  USER_IS_TYPING: 'USER_IS_TYPING',
  PROFILE: 'PROFILE',
}

export default pubsub
