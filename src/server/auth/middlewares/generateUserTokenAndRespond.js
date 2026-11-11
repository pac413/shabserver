import moment from 'moment'
import { ERRORS_BY_CODE } from 'Errors'
import { respondUnauthenticatedError } from 'Errors/rest'
import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { initCacheOnLogin } from 'Services/cache/initCacheOnLogin'
import { createAccessToken, createRefreshToken } from 'Utils/token'
import { isForbiddenByCountry } from 'Utils/riskScore'

/**
 * Called when the user is authenticated with authenticated with login url from the frontend
 * Generate the accessToken, refreshToken and pass token related information as a response
 */
export default async function generateUserTokenAndRespond(req, res, next) {
  try {
    const [profile, user] = await Promise.all([
      models.Profile.findOne({ user: req.user._id }),
      models.User.findById(req.user._id),
    ])
    if (!profile || !user) {
      respondUnauthenticatedError(req, res, ERRORS_BY_CODE.INVALID_CREDENTIALS)
      return
    }
    if (profile.accountStatus === ProfileStatuses.ADMIN_SUSPENDED) {
      respondUnauthenticatedError(req, res, ERRORS_BY_CODE.SUSPENDED)
      return
    }

    if (profile.accountStatus === ProfileStatuses.DELETED) {
      respondUnauthenticatedError(req, res, ERRORS_BY_CODE.DELETED)
      return
    }

    if (
      profile.riskAssessment &&
      profile.riskAssessment.location &&
      isForbiddenByCountry(profile.riskAssessment.location.country)
    ) {
      respondUnauthenticatedError(
        req,
        res,
        ERRORS_BY_CODE.AUTH_REGISTRATION_PAUSED
      )
      return
    }

    profile.dateActive = moment.utc().toDate()
    await profile.save()
    const [{ accessTokenId, accessToken, accessTokenExpiresAt }, refreshToken] =
      await Promise.all([
        createAccessToken(req.user, profile),
        createRefreshToken(req.user._id, req.useragent.source, req.clientIp),
        initCacheOnLogin(profile._id),
      ])
    res.header('Authorization', accessToken)
    res.json({
      login: 'success',
      accessTokenId,
      accessToken,
      accessTokenExpiresAt,
      refreshToken,
      accountStatus: profile.accountStatus,
      profileId: profile._id,
      primaryLocale: profile.primaryLocale,
      siteRoles: profile.siteRoles,
      isAdmin: req.user.isAdmin,
      status: profile.accountStatus,
      emailConfirmed: !!user.emailConfirmed,
    })
  } catch (error) {
    next(error)
  }
}
