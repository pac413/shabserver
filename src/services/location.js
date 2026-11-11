import moment from 'moment-timezone'
import { find } from 'geo-tz'
import { getGeoCode } from 'Utils/location'
import { Cache } from 'Services/cache'

export const processLocation = async (locationInput) => {
  const { address, city, state, country, zipcode } = locationInput

  const cacheKey = getCacheKey(address, city, state, country, zipcode)
  const cached = await Cache.get(cacheKey)
  if (cached) {
    return JSON.parse(cached)
  }

  const input = `${address} ${city} ${state} ${zipcode} ${country}`
  const data = await getGeoCode(input)
  if (data) {
    const [timeZoneString] = find(data.latitude, data.longitude)
    const timeZone = moment.tz(timeZoneString).utcOffset() / 60
    const location = {
      geoLocation: {
        type: 'Point',
        coordinates: [data.longitude, data.latitude],
      },
      countryCode: data.countryCode,
      timeZone,
      timeZoneString,
    }
    await Cache.set(cacheKey, JSON.stringify(location), 'ex', 60)
    return location
  }
  return null
}

const getCacheKey = (address, city, state, country, zipcode) => {
  let key = ''
  key += address ? `_address:${city}` : ''
  key += city ? `_city:${city}` : ''
  key += state ? `_state:${state}` : ''
  key += country ? `_country:${country}` : ''
  key += zipcode ? `_zipcode:${zipcode}` : ''
  key = key.toLowerCase().replace(/\s/g, '-')
  return key
}

export const getLocationGeocode = async (locationQuery) => {
  // Check if redis cache has geocode for this query
  const cached = await Cache.get(locationQuery)
  if (cached) {
    return JSON.parse(cached)
  }
  const data = await getGeoCode(locationQuery)

  if (data) {
    // Save into redis cache
    await Cache.set(locationQuery, JSON.stringify(data), 'ex', 60)
  }
  return data
}
