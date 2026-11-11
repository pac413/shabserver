export const getCoordinates = (longitude, latitude) => {
  return [
    longitude >= -180 && longitude <= 180 ? longitude : 0,
    latitude >= -90 && latitude <= 90 ? latitude : 0,
  ]
}

export const getValidEnumOrUndefined = (value, enums) => {
  if (value && Object.values(enums).includes(value.toLowerCase())) {
    return value.toLowerCase()
  }
  return undefined
}

export const getValidEnumOrFirst = (value, enums) => {
  const enumORUndefined = getValidEnumOrUndefined(value, enums)
  return enumORUndefined || enums[Object.keys(enums)[0]]
}

export const undefinedOrLowerCase = (s) => {
  return !s || !s.length ? undefined : s.toLowerCase()
}

export const undefinedForEmpty = (s) => {
  return !s || !s.length ? undefined : undefined
}

export const hasDatingProfile = (datingProfile) => {
  if (
    datingProfile.Observance ||
    datingProfile.About_Me ||
    datingProfile.Looking_For ||
    datingProfile.Primary_Personality_Trait ||
    datingProfile.Hashkafa ||
    datingProfile.Ethnic_Background ||
    datingProfile.Torah_Observant_Since ||
    datingProfile.Torah_Learning ||
    datingProfile.Prayer
  ) {
    return true
  }
  return false
}

export const standardizeReligiousAffiliations = (ra) => {
  if (ra === 'in process conversion') {
    return 'conversion'
  }
  if (ra === 'curious gentile') {
    return 'gentile'
  }
  return ra
}

export const parseMigratedDate = (date) => {
  if (!date) {
    return null
  }
  const value = new Date(date)
  if (
    value.getFullYear() === 1990 &&
    value.getMonth() === 1 &&
    value.getDay() === 1
  ) {
    // This means no-date in production
    return null
  }

  return value
}
