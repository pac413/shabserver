import { ERRORS_BY_CODE } from 'Errors'
import { isForbiddenByEmail, isForbiddenByPassword } from 'Utils/riskScore'
import * as journal from 'Utils/journal'
import { respondForbiddenError } from 'Errors/rest'

export default async function checkForbiddenEntryToSite(req, res, next) {
  const { username, email, password } = req.body

  if (isForbiddenByEmail(email || username)) {
    await journal.write(
      `user registration for ${email} is rejected because of blacklisted domain`,
      {
        email,
      },
      ['sign-up', 'sign-up-rejected', 'blacklisted-email']
    )
    return respondForbiddenError(req, res, ERRORS_BY_CODE.AUTH_FORBIDDEN_EMAIL)
  } else if (isForbiddenByPassword(password)) {
    await journal.write(
      `user registration for ${email} is rejected because of blacklisted password`,
      {
        email,
        password,
      },
      ['sign-up', 'sign-up-rejected', 'blacklisted-password']
    )
    return respondForbiddenError(
      req,
      res,
      ERRORS_BY_CODE.AUTH_FORBIDDEN_PASSWORD
    )
  } else {
    next()
  }
}
