import passport from 'passport'
import bodyParser from 'body-parser'
import logout from './endpoints/logout'
import signup from './endpoints/signup'
import refreshAccessToken from './endpoints/refreshAccessToken'
import resetPassword from './endpoints/resetPassword'
import verifyAccessToken from './endpoints/verifyAccessToken'
import setPassword from './endpoints/setPassword'
import restoreAccount from './endpoints/restoreAccount'
import checkLink from './endpoints/checkLink'
import checkForbiddenEntryToSite from './middlewares/checkForbiddenEntryToSite'
import checkMediaAuth from './middlewares/checkMediaAuth'
import generateUserTokenAndRedirect from './middlewares/generateUserTokenAndRedirect'
import generateUserTokenAndRespond from './middlewares/generateUserTokenAndRespond'
import mobileSocialLogin from './endpoints/mobileSocialLogin'
import { restAuthMiddleware } from './middlewares/restAuthMiddleware'
import doHealthcheck from './endpoints/healthcheck'
require('../passportSetup')

export default (app) => {
  app.use(passport.initialize())

  app.use(bodyParser.urlencoded({ extended: true }))

  app.get('/', (req, res) => {
    res.json({})
  })
  app.get('/api/healthcheck', doHealthcheck)
  app.post(
    '/api/v2/auth/local/start',
    passport.authenticate('local', { session: false }),
    checkForbiddenEntryToSite,
    generateUserTokenAndRespond
  )
  app.post(
    '/api/v2/auth/mobile-social-login',
    mobileSocialLogin,
    generateUserTokenAndRespond
  )
  app.get('/api/v2/auth/token_info', verifyAccessToken)
  app.get('/api/v2/auth/refresh-access-token', refreshAccessToken)
  app.post('/api/v2/auth/logout', logout)
  app.post(
    '/api/v2/auth/signup',
    checkForbiddenEntryToSite,
    signup,
    generateUserTokenAndRespond
  )
  app.post('/api/v2/auth/reset-password', resetPassword)
  app.post('/api/v2/auth/set-password', setPassword)
  app.post('/api/v2/auth/check-link', checkLink)
  app.post(
    '/api/v2/auth/restore-account',
    passport.authenticate('local', { session: false }),
    restoreAccount
  )

  app.post(
    '/api/v2/auth/touchid/start',
    passport.authenticate('touchId', { session: false }),
    checkForbiddenEntryToSite,
    generateUserTokenAndRespond
  )

  app.get(
    '/api/v2/auth/google/start',
    passport.authenticate('google', {
      session: false,
      scope: ['profile', 'email'],
    })
  )
  app.get(
    '/api/v2/auth/google/redirect',
    passport.authenticate('google', { session: false }),
    generateUserTokenAndRedirect
  )
  app.get(
    '/api/v2/auth/facebook/start',
    passport.authenticate('facebook', { session: false, scope: ['email'] })
  )
  app.get(
    '/api/v2/auth/facebook/redirect',
    passport.authenticate('facebook', { session: false, scope: ['email'] }),
    generateUserTokenAndRedirect
  )
  app.get(
    '/api/v2/auth/apple/start',
    passport.authenticate('apple', { session: false })
  )
  app.post(
    '/api/v2/auth/apple/redirect',
    passport.authenticate('apple', { session: false }),
    generateUserTokenAndRedirect
  )

  app.use('/api/v2/hostings/*', restAuthMiddleware)
  app.use('/media/*', checkMediaAuth)
}
