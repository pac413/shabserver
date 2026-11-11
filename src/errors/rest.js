import getLocalizedErrorMessage from './getLocalizedErrorMessage'
import { ERRORS_BY_CODE } from './index'

export const respondError = (req, res, status, errorCode) => {
  console.error(status, errorCode)
  const message = getLocalizedErrorMessage(
    errorCode,
    {},
    req.getLocale() || 'en'
  )
  return res.status(status).json({ message, errorCode })
}

export const respondInvalidRequestError = (req, res, errorCode) =>
  respondError(req, res, 400, errorCode)

export const respondUnauthenticatedError = (
  req,
  res,
  errorCode = ERRORS_BY_CODE.UNAUTHORISED
) => respondError(req, res, 401, errorCode)

export const respondForbiddenError = (
  req,
  res,
  errorCode = ERRORS_BY_CODE.FORBIDDEN
) => respondError(req, res, 403, errorCode)

export const respondNotFoundError = (
  req,
  res,
  errorCode = ERRORS_BY_CODE.NOT_FOUND
) => respondError(req, res, 404, errorCode)

export const respondInternalServerError = (
  req,
  res,
  errorCode = ERRORS_BY_CODE.INTERNAL_SERVER_ERROR
) => respondError(req, res, 500, errorCode)
