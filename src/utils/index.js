import models from 'Models'
import punycode from 'punycode/'

export function capitalizeEnglishWords(string) {
  return string
    .split(' ')
    .map((word) => {
      if (/^[ -~]+$/.test(word)) {
        return word.charAt(0).toUpperCase() + word.slice(1)
      }
      return word
    })
    .join(' ')
}

export const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
}

export const getRandomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

export const generateHandle = async (
  firstName,
  lastName,
  originalHandle = ''
) => {
  // generate handle from firstName, lastName by removing space
  let baseHandle = (firstName.charAt(0) + lastName)
    .toLowerCase()
    .replace(/\s/g, '')
  const alphaNumericRegEx = /^([0-9]|[a-z])+([0-9a-z]+)$/i
  if (!alphaNumericRegEx.test(baseHandle)) {
    // if baseHandle is not alpha numeric, use punycode to encode it
    baseHandle = punycode.encode(baseHandle)
  }
  // regex to see if there are already the same handles existing
  const regex = new RegExp(`${baseHandle}(.\\d+)*$`)
  // check if originalHandle matches reg expression
  // yes: simply return the originalHandle
  // no: generate a new handle
  if (originalHandle && regex.test(originalHandle)) {
    return originalHandle
  }
  // check if baseHandle or baseHandle.{number} exists, if so, gets count
  const query = { $regex: regex }
  const similarHandleProfiles = await models.Profile.find({ handle: query })
    .select({ handle: 1 })
    .lean()
  const handles = similarHandleProfiles.map(({ handle }) => handle)
  // attach count at the end of baseHandle to make it unique
  let count = handles.length

  while (handles.includes(`${baseHandle}${count ? '.' + count : ''}`)) {
    count++
  }
  return `${baseHandle}${count ? '.' + count : ''}`
}

/**
 * Add id to the document from _id
 * @param {*} doc Mongoose document
 * @returns sanitized object
 */
export const sanitizeDocument = (doc) => {
  if (!doc) {
    return doc
  }
  doc.id = doc._id
  return doc
}
