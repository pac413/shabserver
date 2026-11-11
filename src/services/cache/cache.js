import Redis from 'ioredis'

const options =
  process.env.NODE_ENV === 'test'
    ? {
        host: process.env.REDIS_TESTING_SERVER,
        port: process.env.REDIS_TESTING_PORT,
        password: process.env.REDIS_TESTING_PASSWORD,
        showFriendlyErrorStack: true,
        retryStrategy: (times) => {
          // reconnect after
          return Math.min(times * 50, 2000)
        },
      }
    : {
        host: process.env.REDIS_SERVER,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD,
        showFriendlyErrorStack: true,
        retryStrategy: (times) => {
          // reconnect after
          return Math.min(times * 50, 2000)
        },
      }

export const Cache = new Redis(options)
