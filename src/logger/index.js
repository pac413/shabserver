import * as Sentry from '@sentry/node'

export const setupLogger = (type) => {
  if (type === 'import') {
    require('./importLogger')
  } else if (type === 'worker') {
    require('./workerLogger')
  } else if (type === 'media-processor') {
    require('./mediaProcessorLogger')
  } else {
    require('./defaultLogger')
  }
}

export const setupSentry = () => {
  if (process.env.NODE_ENV !== 'local') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      environment: process.env.NODE_ENV,
      integrations: [
        // enable HTTP calls tracing
        new Sentry.Integrations.Http({ tracing: true }),
      ],

      // Set tracesSampleRate to 1.0 to capture 100%
      // of transactions for performance monitoring.
      // We recommend adjusting this value in production
      tracesSampleRate: 1.0,
    })
  }
}
