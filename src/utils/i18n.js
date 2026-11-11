import i18n from 'i18n'
import objectPath from 'object-path'
import * as Sentry from '@sentry/node'

export const getTranslatedText = (textData, locale) => {
  if (!textData) {
    return ''
  }
  try {
    // do not translate text if it's not a translatable phrase
    const catalog = i18n.getCatalog(locale)
    if (!objectPath.get(catalog, textData.name)) {
      return textData.name
    }
    const translatedText = i18n.__(
      { locale, phrase: textData.name },
      textData.variables || {}
    )

    if (translatedText.includes(': ""')) {
      return translatedText.replace(': ""', '.')
    }
    return translatedText
  } catch (error) {
    console.error('INVALID_TRANSLATED_TEXT', {
      textData,
      locale,
    })
    Sentry.captureException(
      new Error('INVALID_TRANSLATED_TEXT', { textData, locale })
    )
    return textData.name
  }
}

const getParamsFromHref = (href) => {
  const escapedDelimiter = '&#x2F;'
  const parts = href.split(escapedDelimiter)
  return {
    id: parts.pop(),
    resource: parts.pop(),
  }
}

export const getRawContent = (textData, locale) => {
  let text = getTranslatedText(textData, locale)
  const allMatches = text.matchAll(/<a.+href="(.+)">(.+)<\/a>/g)
  const links = []

  for (const [tag, href, title] of allMatches) {
    const link = {
      href,
      title,
      ...getParamsFromHref(href),
    }
    links.push(link)
    text = text.replace(tag, link.title)
  }

  return {
    text,
    links,
  }
}

export const languageMap = {
  en: 'English',
  he: 'Hebrew',
  es: 'Spanish',
  yi: 'Yiddish',
  ru: 'Russian',
  fr: 'French',
  fa: 'Persian_Farsi',
  ar: 'Arabic',
  bg: 'Bulgarian',
  ch: 'Chinese',
  hr: 'Croatian',
  cs: 'Czech',
  da: 'Danish',
  nl: 'Dutch',
  fi: 'Finnish',
  de: 'German',
  el: 'Greek',
  hi: 'Hindi',
  hu: 'Hungarian',
  it: 'Italian',
  jp: 'Japanese',
  ko: 'Korean',
  no: 'Norwegian',
  pl: 'Polish',
  pt: 'Portuguese',
  pa: 'Punjabi',
  ro: 'Romanian',
  sv: 'Swedish',
  th: 'Thai',
  uk: 'Ukrainian',
}

export const getLanguageName = (locale) => {
  const name = languageMap[locale]
  if (name) {
    return name
  }
  return locale
}
