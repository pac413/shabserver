import http from 'http'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { ApolloServer, AuthenticationError } from 'apollo-server-express'
import { useServer } from 'graphql-ws/lib/use/ws'
import passport from 'passport'
import { WebSocketServer } from 'ws'
import { ERRORS_BY_CODE } from 'Errors'
import { respondUnauthenticatedError } from 'Errors/rest'
import publicResolvers from 'Graphql/resolvers'
import publicSchema from 'Graphql/schemas'
import { getTokenPayload } from 'Server/auth/utils'
import { buildContext } from 'Utils/auth'
import { errorPlugin, formatError } from './errors'
import { timePlugin } from './time'

const AUTH_FREE_GRAPHQL_ENDPOINTS = [
  'globalFeatureFlags',
  'feedItemById',
  'getAllFeedItemComments',
]

const REGEX_INTROSPECTION_QUERY = /\b(__schema|__type)\b/

/**
 * Identify if the request is an introspection query type
 * @param request {GraphQLRequestContext['request]}
 */
const isAuthorizedIntrospectionRequest = (req) =>
  typeof req.body.query === 'string' &&
  REGEX_INTROSPECTION_QUERY.test(req.body.query) &&
  req.query &&
  req.query['x-api-key'] === '3ZQdzIGjDXngdRz'

const isApolloHealthcheckRequest = (req) => {
  const { query } = req.query || {}
  return query === '{__typename}'
}

const graphqlJWTMiddleware = (req, res, next) => {
  if (isAuthorizedIntrospectionRequest(req)) {
    next()
    return
  }

  passport.authenticate(
    'jwt',
    {
      session: false,
    },
    (error, user, info) => {
      if (user) {
        req.user = user
      }
      if (
        isApolloHealthcheckRequest(req) ||
        (req.body &&
          AUTH_FREE_GRAPHQL_ENDPOINTS.includes(req.body.operationName))
      ) {
        next()
        return
      }

      if (error) {
        return respondUnauthenticatedError(req, res)
      } else if (!user) {
        return respondUnauthenticatedError(req, res)
      } else {
        next()
      }
    }
  )(req, res, next)
}

export const startApolloServer = async (app) => {
  const httpServer = http.createServer(app)
  const wsServer = new WebSocketServer({
    // This is the `httpServer` returned by createServer(app);
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/graphql',
  })

  const schema = makeExecutableSchema({
    typeDefs: publicSchema,
    resolvers: publicResolvers,
  })
  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx, msg, args) => {
        const { authToken, locale } = ctx.connectionParams
        let tokenPayload = null
        if (authToken) {
          tokenPayload = await getTokenPayload(authToken)
        }

        if (!tokenPayload) {
          throw new AuthenticationError(ERRORS_BY_CODE.UNAUTHORISED)
        }
        const {
          profileId: activeProfileId,
          userId: activeUserId,
          ...others
        } = tokenPayload
        return buildContext({
          activeProfileId,
          activeUserId,
          locale,
          ...others,
        })
      },
    },
    wsServer
  )
  const apolloServer = new ApolloServer({
    schema,
    uploads: {
      maxFileSize: 10000000, // 10 MB
      maxFiles: 20,
    },
    playground: ['local', 'development'].includes(process.env.NODE_ENV),
    introspection: true,
    plugins: [
      ...(process.env.PERFORMANCE_LOGGING_ENABLED === 'true'
        ? [timePlugin]
        : []),
      errorPlugin,
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
    formatError,
    context: async ({ req, connection }) => {
      if (connection) {
        return buildContext(connection.context)
      }

      if (!req) {
        return
      }

      let activeProfileId
      let activeUserId
      if (
        isApolloHealthcheckRequest(req) ||
        (req.body &&
          AUTH_FREE_GRAPHQL_ENDPOINTS.includes(req.body.operationName)) ||
        isAuthorizedIntrospectionRequest(req)
      ) {
        activeProfileId = (req.user && req.user.profileId) || null
        activeUserId = (req.user && req.user.userId) || null
      } else if (req.user) {
        activeProfileId = req.user.profileId
        activeUserId = req.user.userId
      } else {
        throw new AuthenticationError(ERRORS_BY_CODE.UNAUTHORISED)
      }

      const context = await buildContext({
        activeProfileId,
        activeUserId,
        locale: req.getLocale() || 'en',
        role: (req.user && req.user.role) || null,
      })
      return {
        ...context,
        browser: (req.useragent && req.useragent.browser) || null,
        local: (req.user && req.user.local) || null,
        wallpaper: (req.user && req.user.wallpaper) || null,
      }
    },
  })

  app.use('/graphql', graphqlJWTMiddleware)

  await apolloServer.start()
  apolloServer.applyMiddleware({
    app,
    path: '/graphql',
    bodyParserConfig: { limit: '50mb' },
  })

  return { apolloServer, httpServer }
}
