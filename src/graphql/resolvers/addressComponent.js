import {
  country,
  countries,
  state,
  states,
  city,
  cities,
} from 'Connectors/addressComponent'

export default {
  Query: {
    country: (_, { input }, __) => {
      const result = country(input)
      return { country: result }
    },
    countries: (_, __, ___) => {
      const result = countries()
      return { countries: result }
    },
    state: (_, { input }, __) => {
      const result = state(input)
      return { state: result }
    },
    states: (_, { input }, __) => {
      const result = states(input)
      return { states: result }
    },
    city: (_, { input }, __) => {
      const result = city(input)
      return { city: result }
    },
    cities: (_, { input }, __) => {
      const result = cities(input)
      return { cities: result }
    },
  },
}
