import { AuthenticationError } from 'apollo-server-errors'
import moment from 'moment'
import jwt from 'jsonwebtoken'
import passport from 'passport'
import passportJWT from 'passport-jwt'
import passportGoogleOath from 'passport-google-oauth20'
import passportFacebook from 'passport-facebook'
import passportLocal from 'passport-local'
import passportCustom from 'passport-custom'
import passportApple from 'passport-apple'
import axios from 'axios'
import { createProfileSettings } from 'Connectors/profileSettings'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { ProfileStatuses } from 'Models/profile/enums'
import { Cache } from 'Services/cache'
import {
  JWT_SECRET,
  FB_APP_ID,
  FB_APP_SECRET,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CLIENT_ID,
  APPLE_CLIENT_ID,
  APPLE_KEY_ID,
  APPLE_TEAM_ID,
  APPLE_PRIVATE_KEY,
} from 'Utils/globals'
import { uploadMediaFromUrl, createMedia } from 'Utils/media'
import { generateHandle } from 'Utils'
import { ERRORS_BY_CODE } from 'Errors'
import { generateNoReplyEmail } from 'Utils/email'
import { getRiskAssessment } from 'Utils/riskScore'

const ExtractJwt = passportJWT.ExtractJwt
const JwtStrategy = passportJWT.Strategy
const FacebookStrategy = passportFacebook.Strategy
const GoogleStrategy = passportGoogleOath.Strategy
const LocalStrategy = passportLocal.Strategy
const CustomStrategy = passportCustom.Strategy
const AppleStrategy = passportApple.Strategy

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await models.User.findOne({ email: username })
    if (!user) {
      return done(
        new AuthenticationError(ERRORS_BY_CODE.INVALID_CREDENTIALS),
        false
      )
    }
    const isValid = await user.validatePassword(password)
    if (!isValid) {
      return done(
        new AuthenticationError(ERRORS_BY_CODE.INVALID_CREDENTIALS),
        false
      )
    }
    user.lastLogin = moment.utc().toDate()
    await user.save()
    return done(null, user)
  })
)

passport.use(
  'touchId',
  new CustomStrategy(async (req, done) => {
    const { touchId } = req.body
    const user = await models.User.findOne({ touchId })
    if (!user) {
      return done(
        new AuthenticationError(ERRORS_BY_CODE.INVALID_CREDENTIALS),
        false
      )
    }
    user.lastLogin = moment.utc().toDate()
    await user.save()
    return done(null, user)
  })
)

const fbOptions = {
  clientID: FB_APP_ID,
  clientSecret: FB_APP_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/v2/auth/facebook/redirect`,
  profileFields: ['id', 'emails', 'name', 'picture.type(large)'],
  passReqToCallback: true,
}

passport.use(
  'facebook',
  new FacebookStrategy(
    fbOptions,
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser(
          'facebook',
          profile,
          accessToken,
          req
        )
        user.lastLogin = moment.utc().toDate()
        await user.save()
        return done(null, user)
      } catch (error) {
        console.error('Cannot sign-in using facebook', error)
        return done(new Error(ERRORS_BY_CODE.INVALID_CREDENTIALS), false)
      }
    }
  )
)

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromExtractors([
    ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
    ExtractJwt.fromUrlQueryParameter('accessToken'),
  ]),
  secretOrKey: JWT_SECRET,
}

passport.use(
  'jwt',
  new JwtStrategy(jwtOptions, async (jwtPayload, done) => {
    const { accessTokenId, accountStatus } = jwtPayload
    const blacklisted = await Cache.get(`blacklisted_token_${accessTokenId}`)
    if (blacklisted) {
      return done(true, null)
    }
    if (accountStatus === ProfileStatuses.DELETED) {
      return done(true, null)
    }
    done(null, jwtPayload)
  })
)

const googleAuthOptions = {
  clientID: GOOGLE_CLIENT_ID,
  clientSecret: GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/api/v2/auth/google/redirect`,
  passReqToCallback: true,
}

passport.use(
  new GoogleStrategy(
    googleAuthOptions,
    async (req, token, refreshToken, profile, done) => {
      try {
        const user = await findOrCreateUser('google', profile, token, req)
        user.lastLogin = moment.utc().toDate()
        await user.save()
        return done(null, user)
      } catch (error) {
        console.error('Cannot sign-in using google', error)
        return done(null, { error })
      }
    }
  )
)

const appleAuthOptions = {
  clientID: APPLE_CLIENT_ID,
  teamID: APPLE_TEAM_ID,
  callbackURL: `${process.env.SERVER_URL}/api/v2/auth/apple/redirect`,
  keyID: APPLE_KEY_ID,
  privateKeyString: APPLE_PRIVATE_KEY,
  passReqToCallback: true,
}

passport.use(
  new AppleStrategy(
    appleAuthOptions,
    async (req, accessToken, refreshToken, idToken, profile, done) => {
      try {
        // The idToken returned is encoded. You can use the jsonwebtoken library via jwt.decode(idToken)
        // to access the properties of the decoded idToken properties which contains the user's
        // identity information.
        // Here, check if the idToken.sub exists in your database!
        // idToken should contains email too if user authorized it but will not contain the name
        // `profile` parameter is REQUIRED for the sake of passport implementation
        // it should be profile in the future but apple hasn't implemented passing data
        // in access token yet https://developer.apple.com/documentation/sign_in_with_apple/tokenresponse
        const decoded = jwt.decode(idToken)
        const { firstName, lastName } = prepareNameForAppleLogin(
          req.appleProfile
        )
        const user = await findOrCreateUser(
          'apple',
          {
            emails: [{ value: decoded.email }],
            id: decoded.sub,
            name: {
              givenName: firstName,
              familyName: lastName,
            },
            displayName: `${firstName} ${lastName}`,
          },
          idToken,
          req
        )
        user.lastLogin = moment.utc().toDate()
        await user.save()
        return done(null, user)
      } catch (error) {
        console.error('Cannot sign-in using apple', error)
        return done(null, { error })
      }
    }
  )
)

function prepareNameForAppleLogin(appleProfile) {
  let firstName = ''
  let lastName = ''
  if (appleProfile && appleProfile.name) {
    firstName = appleProfile.name.firstName
    lastName = appleProfile.name.lastName
  }

  return { firstName, lastName }
}

export async function findOrCreateUser(method, providerData, token, req) {
  const email = providerData.emails ? providerData.emails[0].value : null

  let user
  // if there is an email
  // try to find an existing user by that email
  if (email) {
    user = await models.User.findOne({ email })

    // remember provider id if it's missing
    if (user && (!user[method] || !user[method].id)) {
      user[method] = {
        id: providerData.id,
        token,
      }
      await user.save()
    }
  }

  // if there is no user with that email or email is not provided
  // fallback to the vendor id
  if (!user) {
    user = await models.User.findOne({ [`${method}.id`]: providerData.id })
  }

  // this email will be used
  // if vendor didn't provided any email
  // user will be able to change it later in settings
  const fallbackEmail = generateNoReplyEmail()

  // if user do not exist in the system - create it
  if (!user) {
    const userData = {
      firstName: providerData.name.givenName,
      lastName: providerData.name.familyName,
      email: email || fallbackEmail,
      emailConfirmed: true,
      [method]: {
        id: providerData.id,
        token,
      },
    }

    // in case if vendor didn't provided names
    if (!userData.firstName || !userData.lastName) {
      // let's extract it from displayName
      const [firstName, lastName] = providerData.displayName.split(' ')
      userData.firstName = firstName
      userData.lastName = lastName
    }

    // create a new User
    user = await models.User.create(userData)

    const [handle, riskAssessment] = await Promise.all([
      generateHandle(user.firstName, user.lastName),
      getRiskAssessment({ req, email }),
    ])

    const profile = await models.Profile.create({
      user: user._id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      displayName: `${user.firstName} ${user.lastName}`,
      handle,
      accountStatus: ProfileStatuses.INCOMPLETE,
      riskAssessment,
    })

    await createProfileSettings(profile._id)

    await uploadAndSetAvatar(method, providerData, profile, token)
  }
  return user
}

async function uploadAndSetAvatar(method, providerData, profile, token) {
  if (providerData.photos) {
    if (providerData.provider === 'google') {
      const { data } = await axios({
        method: 'get',
        url: 'https://content-people.googleapis.com/v1/people/me?personFields=photos',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (data.photos && data.photos[0] && data.photos[0].default) {
        console.info(
          "Google image was skipped because it's a default image",
          data.photos
        )
        return true
      }
    }

    const avatarUrl = providerData.photos[0].value.replace('=s96-c', '')
    const mediaKey = `${method}_avatar`
    await uploadMediaFromUrl(
      avatarUrl,
      profile._id,
      MediaType.PICTURE,
      MediaSubType.AVATAR,
      mediaKey,
      true
    )
    const avatarMedia = await createMedia({
      mediaUrl: avatarUrl,
      profileId: profile._id,
      mediaType: MediaType.PICTURE,
      mediaSubType: MediaSubType.AVATAR,
      reference: {},
      mediaKey,
      socialProvider: true,
    })

    profile.avatar = avatarMedia._id
    return profile.save()
  }
}
