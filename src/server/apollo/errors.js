import * as Sentry from '@sentry/node'
import { ApolloError } from 'apollo-server-errors'
import { getTranslatedText } from 'Utils/i18n'

/**
 * This plugin localizes the error messages
 */
export const errorPlugin = {
  requestDidStart() {
    return {
      didEncounterErrors({ context, errors, operation, request }) {
        if (operation) {
          errors.forEach((err) => {
            if (err instanceof ApolloError) {
              return
            }
            Sentry.withScope((scope) => {
              // Annotate whether failing operation was query/mutation/subscription
              scope.setTag('kind', operation.operation)
              // Log query and variables as extras
              // (make sure to strip out sensitive data!)
              scope.setExtra('query', request.query)
              scope.setExtra('variables', request.variables)
              if (err.path) {
                // We can also add the path as breadcrumb
                scope.addBreadcrumb({
                  category: 'query-path',
                  message: err.path.join(' > '),
                })
              }
              Sentry.captureException(err)
            })
          })
        }
        errors.forEach((err) => {
          const errorName = err.message
          const errorVariables = err.extensions || {}

          err.message = getTranslatedText(
            {
              name: errorName,
              variables: errorVariables,
            },
            context.locale
          )
        })
      },
    }
  },
}

export const formatError = (err) => {
  console.error('GraphqlError: ', { error: JSON.stringify(err) })
  if (['local', 'development'].includes(process.env.NODE_ENV)) {
    return err
  }

  // Remove the stack trace by GraphQL Errors in non-development mode
  if (!err.extensions) {
    return err
  }

  // Remove the stack trace by GraphQL Errors in production mode
  if (err.extensions.code === 'INTERNAL_SERVER_ERROR') {
    return new Error(err.message)
  } else if (err.extensions.exception.stacktrace) {
    err.extensions.exception = undefined
  }
  return err
}
