import { AuthenticationError } from 'apollo-server-express'
import {
  respondInternalServerError,
  respondUnauthenticatedError,
} from 'Errors/rest'

const errorHandler = (err, req, res, next) => {
  if (!err) {
    next()
    return
  }

  console.error('RestAPI Error: ', err)
  if (res.headersSent) {
    return next(err)
  }
  if (err instanceof AuthenticationError) {
    respondUnauthenticatedError(req, res, err.message)
  } else {
    respondInternalServerError(req, res)
  }
}

const setupErrorHandler = (app) => {
  app.use(errorHandler)
}

export default setupErrorHandler
