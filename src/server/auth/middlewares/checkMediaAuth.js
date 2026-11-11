import passport from 'passport'

export default async function checkMediaAuth(req, res, next) {
  passport.authenticate(
    'jwt',
    {
      session: false,
    },
    (_, user) => {
      if (user) {
        req.user = user
      }
      next()
    }
  )(req, res, next)
}
