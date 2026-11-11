import passport from 'passport'
import { respondUnauthenticatedError } from 'Errors/rest'
import { getTokenInfo } from 'Server/auth/utils'
import { initCacheOnLogin } from 'Services/cache/initCacheOnLogin'

/**
 * /api/v2/auth/token_info
 */
export default async function (req, res, next) {
  passport.authenticate('jwt', { session: false }, async (_err, user, info) => {
    if (user) {
      req.user = user
      const [payload] = await Promise.all([
        getTokenInfo(user),
        initCacheOnLogin(user.profileId),
      ])

      if (payload) {
        return res.json(payload)
      }
    }
    return respondUnauthenticatedError(req, res)
  })(req, res, next)
}
