import { respondUnauthenticatedError } from 'Errors/rest'
import models from 'Models'
import { createAccessToken, verifyRefreshToken } from 'Utils/token'

/**
 * /api/v2/auth/refresh-access-token
 */
export default async function (req, res) {
  const refreshToken = req.headers.authorization
    ? req.headers.authorization.replace('Bearer ', '')
    : null

  if (!refreshToken) {
    return respondUnauthenticatedError(req, res)
  }

  const result = await verifyRefreshToken(refreshToken)
  if (result) {
    const user = await models.User.findById(result.user)
    const profile = await models.Profile.findOne({ user: result.user })
    if (!user | !profile) {
      // User doesn't exist for this token
      return respondUnauthenticatedError(req, res)
    }
    const { accessToken, accessTokenExpiresAt } = await createAccessToken(
      user,
      profile
    )
    return res.json({
      accessToken,
      accessTokenExpiresAt,
    })
  }
  return respondUnauthenticatedError(req, res)
}
