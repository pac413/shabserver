import { getTranslatedText } from 'Utils/i18n'

export default function getLocalizedErrorMessage(
  errorCode,
  variables = {},
  locale = 'en'
) {
  return getTranslatedText(
    {
      name: errorCode,
      variables,
    },
    locale
  )
}
