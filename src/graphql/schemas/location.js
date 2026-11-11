import { gql } from 'apollo-server-express'

export default gql`
  type Location {
    city: String!
    state: String!
    country: String!
    address: String
    zipcode: String
    geoLocation: GeoCoordinates
    timeZone: Float
  }

  type GeoCoordinates {
    coordinates: [Float]
  }

  input GeoCoordinatesInput {
    coordinates: [Float]
  }

  input LocationInput {
    address: String
    city: String
    state: String
    zipcode: String
    country: String
    geoLocation: GeoCoordinatesInput
  }
`
