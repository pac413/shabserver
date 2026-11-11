import moment from 'moment'
import { ERRORS_BY_CODE } from 'Errors'
import {
  respondInternalServerError,
  respondUnauthenticatedError,
} from 'Errors/rest'
import models from 'Models'
import { sendResetPassword } from 'Services/email'
import { FRONTEND_URL, RESET_PASSWORD_EXPIRES } from 'Utils/globals'
import { ProfileStatuses } from 'Models/profile/enums'
import { getTranslatedText } from 'Utils/i18n'

/**
 * /api/v2/auth/reset-password
 */
export default async function (req, res) {
  const { email } = req.body

  const user = await models.User.findOne({ email })
  if (!user) {
    return respondUnauthenticatedError(req, res, ERRORS_BY_CODE.USER_NOT_FOUND)
  }

  const profile = await models.Profile.findOne({ user: user.id })
  if (!profile) {
    return respondUnauthenticatedError(req, res, ERRORS_BY_CODE.USER_NOT_FOUND)
  }
  if (profile.accountStatus === ProfileStatuses.ADMIN_SUSPENDED) {
    return respondUnauthenticatedError(req, res, ERRORS_BY_CODE.AUTH_ERROR)
  }

  try {
    const resetPassword = new models.ResetPassword({
      user: user._id,
      expires: moment().add(RESET_PASSWORD_EXPIRES, 'seconds'),
    })
    await resetPassword.save()

    await sendResetPassword({
      recipientName: user.firstName + ' ' + user.lastName,
      recipientEmail: user.email,
      resetPasswordLink: `${FRONTEND_URL}/set-new-password/${resetPassword.id}`,
    })
  } catch (e) {
    console.error('Failed to reset password', e)
    return respondInternalServerError(req, res)
  }

  res.json({
    success: true,
    message:
      profile.accountStatus === ProfileStatuses.DELETED
        ? getTranslatedText(
            {
              name: 'auth.reset-for-deleted-account',
            },
            req.getLocale() || 'en'
          )
        : undefined,
  })
}
