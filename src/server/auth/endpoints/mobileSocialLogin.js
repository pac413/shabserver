import moment from 'moment'
import { respondInternalServerError } from 'Errors/rest'
import { findOrCreateUser } from 'Server/passportSetup'
import jwt from 'jsonwebtoken'

/**
 * /api/v2/auth/mobile-social-login
 */
export default async function (req, res, next) {
  const { method, firstName, lastName, token, photo } = req.body
  const photos = photo ? [{ value: photo }] : null

  let email = req.body.email
  let id = req.body.id
  if (method === 'apple') {
    const decoded = jwt.decode(token)
    email = decoded.email
    id = decoded.sub
  }

  try {
    const user = await findOrCreateUser(
      method,
      {
        emails: [{ value: email }],
        name: {
          givenName: firstName,
          familyName: lastName,
        },
        photos,
        id,
      },
      token,
      req
    )

    user.lastLogin = moment.utc().toDate()
    await user.save()
    req.user = user

    next()
  } catch (error) {
    console.log('Error happened during mobile social login', error)
    respondInternalServerError(req, res)
  }
}
