import validator from 'validator'
import { createProfileSettings } from 'Connectors/profileSettings'
import { ERRORS_BY_CODE } from 'Errors'
import {
  respondInternalServerError,
  respondInvalidRequestError,
  respondUnauthenticatedError,
} from 'Errors/rest'
import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { sendEmailVerificationRequest } from 'Services/email'
import { generateHandle } from 'Utils'
import { FRONTEND_URL } from 'Utils/globals'
import { getRiskAssessment, isForbiddenByCountry } from 'Utils/riskScore'
import * as journal from 'Utils/journal'

/**
 * /api/v2/auth/signup
 */
export default async function (req, res, next) {
  const { firstName, lastName, email, password } = req.body

  if (!firstName) {
    return respondInvalidRequestError(
      req,
      res,
      ERRORS_BY_CODE.INVALID_FIRST_NAME
    )
  }
  if (!lastName) {
    return respondInvalidRequestError(
      req,
      res,
      ERRORS_BY_CODE.INVALID_LAST_NAME
    )
  }
  if (!email || !validator.isEmail(email)) {
    return respondInvalidRequestError(req, res, ERRORS_BY_CODE.INVALID_EMAIL)
  }
  if (!password || !validator.isLength(password, { min: 6 })) {
    return respondInvalidRequestError(
      req,
      res,
      ERRORS_BY_CODE.INVALID_PASSWORD_LENGTH
    )
  }

  try {
    req.user = await models.User.create({
      firstName,
      lastName,
      email,
      password: await models.User.generatePasswordHash(password),
    })

    const [handle, riskAssessment] = await Promise.all([
      generateHandle(firstName, lastName),
      getRiskAssessment({ req, email }),
    ])

    if (
      riskAssessment &&
      riskAssessment.location &&
      isForbiddenByCountry(riskAssessment.location.country)
    ) {
      return respondInvalidRequestError(
        req,
        res,
        ERRORS_BY_CODE.AUTH_REGISTRATION_PAUSED
      )
    }

    const profile = await models.Profile.create({
      user: req.user._id,
      email,
      firstName,
      lastName,
      displayName: `${firstName} ${lastName}`,
      handle,
      accountStatus: ProfileStatuses.INCOMPLETE,
      riskAssessment,
      primaryLocale: req.getLocale() || 'en',
    })
    req.user.profileId = profile._id

    await createProfileSettings(profile._id)

    await journal.write(
      'user registration successful',
      {
        firstName,
        lastName,
        email,
        userId: req.user._id,
        profileId: profile._id,
      },
      ['sign-up', 'sign-up-successful']
    )

    await sendEmailVerificationRequest({
      profileId: profile._id,
      profileEmail: email,
      profileFirstName: firstName,
      confirmActionRedirectUrl: `${FRONTEND_URL}/action/confirm-email/confirm/${req.user.emailToken}`,
    })

    next()
  } catch (e) {
    console.error('Failed to send email verification: ', e)
    if (e.code === 11000) {
      // check if account is deleted
      // in order to prompt to restore
      const profile = await models.Profile.findOne({ email })
      if (profile && profile.accountStatus === ProfileStatuses.DELETED) {
        respondUnauthenticatedError(req, res, ERRORS_BY_CODE.DELETED)
        return
      }
      respondInvalidRequestError(req, res, ERRORS_BY_CODE.DUPLICATE_EMAIL)
    } else {
      respondInternalServerError(req, res)
    }
  }
}
