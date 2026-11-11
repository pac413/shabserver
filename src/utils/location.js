import NodeGeocoder from 'node-geocoder'
import countries from 'i18n-iso-countries'
import { GOOGLE_GEOCODING_API_KEY } from './globals'

export const getGeoCode = async (query) => {
  const geocoder = NodeGeocoder({
    provider: 'google',
    apiKey: GOOGLE_GEOCODING_API_KEY,
  })
  const results = await geocoder.geocode(query)
  if (results && results.length) {
    return results[0]
  }
  return null
}

export const getLocal = (country) => {
  return countries.getAlpha2Code(country) || 'US'
}

export const getLocationDisplay = (location) => {
  if (!location) {
    return ''
  }
  const locationParts = [
    location.address,
    location.city,
    location.state,
    location.country,
    location.zip,
  ]
  return locationParts.filter((part) => part).join(', ')
}
