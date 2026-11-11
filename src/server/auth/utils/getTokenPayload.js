import { AuthenticationError } from 'apollo-server-express'
import jwt from 'jsonwebtoken'
import { ERRORS_BY_CODE } from 'Errors'
import { JWT_SECRET, JWT_EXPIRES } from 'Utils/globals'

/**
 * This just returns the jwt token information
 * @param {string} token jwt token
 */
export default async function getTokenPayload(token) {
  if (token) {
    try {
      const res = await jwt.verify(token.replace('Bearer ', ''), JWT_SECRET, {
        maxAge: JWT_EXPIRES,
      })
      return res
    } catch (error) {
      throw new AuthenticationError(ERRORS_BY_CODE.INVALID_TOKEN)
    }
  }
  return null
}
