import moment from 'moment'
import { ERRORS_BY_CODE } from 'Errors'
import { respondUnauthenticatedError } from 'Errors/rest'
import models from 'Models'
import { initCacheOnLogin } from 'Services/cache/initCacheOnLogin'
import { FRONTEND_URL } from 'Utils/globals'
import { createAccessToken, createRefreshToken } from 'Utils/token'
import { isForbiddenByCountry } from 'Utils/riskScore'

/**
 * Called when the user is authorized with 3rd party apps like facebook and google
 * Generate accessToken and refreshToken and pass them to the frontend redirect link
 */
export default async function generateUserTokenAndRedirect(req, res) {
  if (req.user.error) {
    res.redirect(`${FRONTEND_URL}/login?error=1`)
    return
  }
  const profile = await models.Profile.findOne({ user: req.user._id })
  if (!profile) {
    respondUnauthenticatedError(ERRORS_BY_CODE.INVALID_TOKEN)
    return
  }

  if (
    profile.riskAssessment &&
    profile.riskAssessment.location &&
    isForbiddenByCountry(profile.riskAssessment.location.country)
  ) {
    return
  }

  profile.dateActive = moment.utc().toDate()
  await profile.save()
  const [{ accessToken, accessTokenExpiresAt }, refreshToken] =
    await Promise.all([
      createAccessToken(req.user, profile),
      createRefreshToken(req.user._id, req.useragent.source, req.clientIp),
      initCacheOnLogin(profile._id),
    ])

  res.redirect(
    `${FRONTEND_URL}/login-callback?access_token=${accessToken}&access_token_expires_at=${accessTokenExpiresAt}&refresh_token=${refreshToken}`
  )
}
