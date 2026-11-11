import csc from 'country-state-city'

export const country = ({ id, code }) => {
  if (id) {
    return csc.getCountryById(id)
  }
  return csc.getCountryByCode(code)
}

export const countries = () => {
  return csc.getAllCountries()
}

export const state = ({ id }) => {
  return csc.getStateById(id)
}

export const states = ({ countryId }) => {
  return csc.getStatesOfCountry(countryId)
}

export const city = ({ id }) => {
  return csc.getCityById(id)
}

export const cities = ({ stateId }) => {
  return csc.getCitiesOfState(stateId)
}
