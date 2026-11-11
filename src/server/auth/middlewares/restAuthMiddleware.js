import { respondUnauthenticatedError } from 'Errors/rest'
import passport from 'passport'

export function restAuthMiddleware(req, res, next) {
  passport.authenticate(
    'jwt',
    {
      session: false,
    },
    (_, user) => {
      if (!user) {
        return respondUnauthenticatedError(req, res)
      }
      req.user = user
      next()
    }
  )(req, res, next)
}
