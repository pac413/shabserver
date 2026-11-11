import moment from 'moment'
import { capitalize, startCase } from 'lodash'
import { getSettingsWithDefaults } from 'Connectors/profileSettings'
import models from 'Models'
import { SHABBAT_TEST_EMAILS } from 'Utils/globals'

export const getRecipientProfileSetting = async (body) => {
  const profileSettings = await models.ProfileSettings.findOne({
    profile: body.profileId || body.recipientId,
  }).lean()
  return getSettingsWithDefaults(profileSettings)
}

export const adjustRecipientEmail = (email) => {
  switch (process.env.NODE_ENV) {
    case 'local':
    case 'production':
      return email
    case 'staging':
      return SHABBAT_TEST_EMAILS.QA
    case 'uat':
      return SHABBAT_TEST_EMAILS.UAT
    case 'development':
    case 'test':
    default:
      return SHABBAT_TEST_EMAILS.DEV
  }
}

export const buildDate = (apiDate) => {
  let dateStr = ''
  const conciseDate = moment(apiDate.date).format('MMMM d')
  const fullDay = moment(apiDate.date).format('dddd, MMMM D, YYYY')
  if (fullDay.includes('Saturday')) {
    dateStr = fullDay.replace(
      'Saturday',
      `Shabbat ${apiDate.hebrewDescription}`
    )
  } else {
    dateStr = `${capitalize(apiDate.type)} ${
      apiDate.hebrewDescription
    } ${conciseDate}`
  }

  return dateStr
}

export const buildPartsText = (hostParts) => {
  if (!hostParts.length) {
    return ''
  }

  let partsStr = '<br><br> Invite is relevant for the following: <i>'
  partsStr += hostParts
    .filter((part) => part.length)
    .map((part) => startCase(part))
    .join(', ')
  partsStr += '</i>'
  partsStr += `<hr style='color: black;'>`

  return partsStr
}
