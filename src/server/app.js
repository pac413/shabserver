import * as Sentry from '@sentry/node'
import * as Tracing from '@sentry/tracing'
import bodyParser from 'body-parser'
import cors from 'cors'
import express from 'express'
import useragent from 'express-useragent'
import mustacheExpress from 'mustache-express'
import requestIp from 'request-ip'
import startTasks from 'Tasks'
import { startApolloServer } from './apollo'
import setupAuthLayer from './auth'
import setupErrorHandler from './error'
import setupI18n from './i18n'
import { setupHostingRestApis } from './rest-apis/hosting'
import { setupMedia } from './rest-apis/media'
import { setupMobileAppVersionEndpoint } from './rest-apis/mobile-app-version'

if (process.env.RUN_TASKS === 'true') {
  console.log('starting tasks')
  startTasks()
}

const app = express()
const isLocalEnv = process.env.NODE_ENV === 'local'

app.engine('html', mustacheExpress())
app.set('view engine', 'mustache')
app.set('views', process.cwd() + '/public')

if (!isLocalEnv) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    integrations: [
      // enable HTTP calls tracing
      new Sentry.Integrations.Http({ tracing: true }),
      // enable Express.js middleware tracing
      new Tracing.Integrations.Express({ app }),
    ],

    // Set tracesSampleRate to 1.0 to capture 100%
    // of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: 1.0,
  })

  // RequestHandler creates a separate execution context using domains, so that every
  // transaction/span/breadcrumb is attached to its own Hub instance
  app.use(
    Sentry.Handlers.requestHandler({
      serverName: 'Shabbat',
      ip: true,
      user: ['_id', 'email', 'firstName', 'lastName', 'role', 'emailConfirmed'],
    })
  )
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler())
}

app.use(
  bodyParser.json({
    limit: '50mb',
  })
)
app.use(useragent.express())
app.use(cors({ exposedHeaders: 'Authorization' }))
app.use(requestIp.mw())

setupI18n(app)
setupAuthLayer(app)
setupMedia(app)
setupHostingRestApis(app)
setupMobileAppVersionEndpoint(app)

startApolloServer(app).then(({ apolloServer, httpServer }) => {
  const PORT = process.env.PORT || 8080
  httpServer.listen({ port: PORT }, () => {
    console.info(
      `Server ready at http://localhost:${PORT}${apolloServer.graphqlPath}`
    )
    console.info(
      `Subscriptions ready at ws://localhost:${PORT}${apolloServer.graphqlPath}`
    )
  })
})

if (!isLocalEnv) {
  app.use(
    Sentry.Handlers.errorHandler({
      shouldHandleError(error) {
        console.log('Error Status', error.status)
        // Capture all 404 and 500 errors
        if (error.status === 404 || error.status === 500) {
          return true
        }
        return false
      },
    })
  )
}
setupErrorHandler(app)
