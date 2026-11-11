import moment from 'moment'
import { ERRORS_BY_CODE } from 'Errors'
import { respondUnauthenticatedError } from 'Errors/rest'
import models from 'Models'

/**
 * /api/v2/auth/set-password
 */
export default async function (req, res) {
  const { token, password } = req.body
  const request = await models.ResetPassword.findOne({
    _id: token,
    expires: {
      $gt: moment.utc().toDate(),
    },
  })

  if (!request) {
    return respondUnauthenticatedError(
      req,
      res,
      ERRORS_BY_CODE.RESET_PASSWORD_TOKEN_NOT_FOUND
    )
  }

  const user = await models.User.findById(request.user)
  if (!user) {
    return respondUnauthenticatedError(req, res, ERRORS_BY_CODE.USER_NOT_FOUND)
  }

  user.password = await models.User.generatePasswordHash(password)
  await user.save()

  await models.ResetPassword.deleteOne({
    _id: request._id,
  })

  res.json({
    success: true,
  })
}
