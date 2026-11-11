import escapeRegex from 'escape-string-regexp'
import models from 'Models'

export async function autoTypeSearchOccupations(input, context) {
  const { keyword, language, limit } = input
  const startWithRegex = new RegExp('^' + escapeRegex(keyword), 'i')

  const occupations = await models.Occupation.find({
    name: startWithRegex,
    lang: language,
  }).limit(limit)

  return occupations
}
