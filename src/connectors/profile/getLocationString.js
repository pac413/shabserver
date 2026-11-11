/**
 * Get location string from a user profile
 * @param {*} profile user profile data
 * @param {*} requiresFull boolean value to get full location string(address, city, state, country) or general one(city, state)
 */
export default function getLocationString(profile, requiresFull = false) {
  if (!profile.location) {
    return ''
  }
  const { address, city, state, country } = profile.location

  let locationString = ''
  if (requiresFull) {
    if (address) {
      locationString += address
    }
    if (city) {
      locationString += `, ${city}`
    }
    if (state) {
      locationString += `, ${state}`
    }
    if (country) {
      locationString += `, ${country}`
    }
  } else {
    if (city) {
      locationString += city
    }
    // If country is US / Canada, just show state
    // If not, just show country
    if (state) {
      locationString += `, ${state}`
    } else if (country) {
      locationString += `, ${country}`
    }
  }

  return locationString
}
