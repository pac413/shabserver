import dotenv from 'dotenv'
import Jimp from 'jimp'
dotenv.config()

export const FRONTEND_URL = process.env.FRONTEND_URL
export const LEGACY_API_URL = process.env.LEGACY_API_URL
export const JWT_SECRET = process.env.JWT_SECRET
export const JWT_EXPIRES = process.env.JWT_EXPIRES
export const MICROSERVICE_JWT_SECRET = process.env.MICROSERVICE_JWT_SECRET
export const MICROSERVICE_JWT_EXPIRES = +process.env.MICROSERVICE_JWT_EXPIRES
export const DELIVER_EMAILS = process.env.DELIVER_EMAILS === 'true'
export const S3_SIGNED_URL_EXPIRATION = 2 * 24 * 60 * 60 // 2 days (secs)
export const RESET_PASSWORD_EXPIRES = process.env.RESET_PASSWORD_EXPIRES

export const FB_APP_ID = process.env.FB_APP_ID
export const FB_APP_SECRET = process.env.FB_APP_SECRET

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
export const GOOGLE_GEOCODING_API_KEY = process.env.GOOGLE_GEOCODING_API_KEY

export const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID
export const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID
export const APPLE_KEY_ID = process.env.APPLE_KEY_ID
export const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY.replace(
  /\\n/gm,
  '\n'
)

export const DEFAULT_FRIENDS = process.env.DEFAULT_FRIENDS
  ? process.env.DEFAULT_FRIENDS.split(' ')
  : []

export const TESTING_EMAILS = process.env.TESTING_EMAILS
  ? process.env.TESTING_EMAILS.split(' ')
  : []

export const SCAMMER_DOMAIN_EXTENSIONS = process.env.SCAMMER_DOMAIN_EXTENSIONS
  ? process.env.SCAMMER_DOMAIN_EXTENSIONS.split(' ').map((i) => i.toUpperCase())
  : []

export const SCAMMER_PASSWORD_PHRASES = process.env.SCAMMER_PASSWORD_PHRASES
  ? process.env.SCAMMER_PASSWORD_PHRASES.split(' ')
  : []

export const SCAMMER_COUNTRY_SOURCE_IP = process.env.SCAMMER_COUNTRY_SOURCE_IP
  ? process.env.SCAMMER_COUNTRY_SOURCE_IP.split(' ').map((item) =>
      item.toLowerCase()
    )
  : []

export const HIGH_MIN_FRAUD_SCORE = process.env.HIGH_MIN_FRAUD_SCORE
export const IP_RISK_SCORE = process.env.IP_RISK_SCORE

export const MAXMIND_ID = process.env.MAXMIND_ID
export const MAXMIND_KEY = process.env.MAXMIND_KEY

export const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID
export const ONESIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY

export const IFRAMELY_URL = process.env.IFRAMELY_URL
export const IFRAMELY_KEY = process.env.IFRAMELY_KEY

export const MAILCHIMP_KEY = process.env.MAILCHIMP_KEY
export const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER
export const MAILCHIMP_AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID
export const ADD_NEW_USERS_TO_MAILCHIMP =
  process.env.ADD_NEW_USERS_TO_MAILCHIMP === 'true'

export const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY
export const NO_REPLY_EMAIL =
  process.env.NO_REPLY_EMAIL || 'noreply@shabbat.com'
export const OLAMI_EMAIL = process.env.OLAMI_EMAIL || 'sdcleads@olami.org'

export const Roles = Object.freeze({
  Admin: 'admin',
  Member: 'member',
})

export const THUMBNAILS = Object.freeze({
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  THUMBNAIL: 'thumbnail',
})

export const QUALITY = Object.freeze({
  LOW: 'low',
})

export const AVATAR_THUMBNAILS = [
  {
    name: THUMBNAILS.SMALL,
    size: 50,
  },
  {
    name: THUMBNAILS.MEDIUM,
    size: 200,
  },
  {
    name: THUMBNAILS.LARGE,
    size: 500,
  },
]

export const PICTURE_THUMBNAILS = [
  {
    name: THUMBNAILS.MEDIUM,
    size: 200,
  },
  {
    name: THUMBNAILS.LARGE,
    size: 500,
  },
]

export const ATTACHMENT_THUMBNAILS = [
  {
    name: THUMBNAILS.THUMBNAIL,
    size: { w: 500, h: Jimp.AUTO },
  },
]

export const VIDEO_THUMBNAILS = [
  {
    name: THUMBNAILS.THUMBNAIL,
    size: 500,
  },
]

export const VIDEO_QUALITY = [
  {
    name: QUALITY.LOW,
    size: 426, // 240p = 426 x 240
  },
]

export const DEFAULT_WALLPAPER =
  'https://shabbat-com.s3.us-east-2.amazonaws.com/background.jpeg'

export const DEFAULT_SHABBAT_PROFILE_S3_KEY = 'shabbat_default'

export const DEFAULT_SHABBAT_WALLPAPER_PREFIX =
  'https://old.shabbat.com/assets/app/cover-picture'

export const AUTO_ASSIGN_ALL_RESTRICTIONS_ON_MEMBER_REPORTING = true

export const IS_MOCK_IMPORT = !!process.env.IMPORT
export const IS_MIGRATE = !!process.env.MIGRATE

export const MILE_TO_METER = 1609.34
export const EQUATORIAL_RADIUS = 3963.2 // equatorial radius of the earth in miles

export const ACTIVE_PROFILES_DAYS_SINCE = 60

export const RECENT_MEMBERSHIP_DAYS_SINCE = 90

export const SENDGRID_EMAIL_TEMPLATES = {
  HOSTING: 'd-e15ec485dbbc4706b04667c6f2b1c376',
  OLAMI: 'd-eb17208537b047aba8c4ad64ac0499ab',
}

export const SHABBAT_TEST_EMAILS = {
  DEV: 'dev-email-testing@shabbat.com',
  QA: 'qa-email-testing@shabbat.com',
  UAT: 'uat-email-testing@shabbat.com',
}
