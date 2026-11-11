import { gql } from 'apollo-server-express'

export default gql`
  type Country {
    id: String!
    sortname: String!
    name: String!
    phonecode: String!
  }

  type State {
    id: String!
    name: String!
    country_id: String!
  }

  type City {
    id: String
    name: String
    state_id: String
  }

  input CountryInput {
    id: String
    code: String
  }

  input StateInput {
    id: String!
  }

  input StatesInput {
    countryId: String!
  }

  input CityInput {
    id: String!
  }

  input CitiesInput {
    stateId: String!
  }

  type CountryPayload {
    country: Country
  }

  type CountriesPayload {
    countries: [Country!]!
  }

  type StatePayload {
    state: State
  }

  type StatesPayload {
    states: [State!]!
  }

  type CityPayload {
    city: City
  }

  type CitiesPayload {
    cities: [City]
  }

  extend type Query {
    country(input: CountryInput): CountryPayload
    countries: CountriesPayload
    state(input: StateInput): StatePayload
    states(input: StatesInput): StatesPayload
    city(input: CityInput): CityPayload
    cities(input: CitiesInput): CitiesPayload
  }
`
