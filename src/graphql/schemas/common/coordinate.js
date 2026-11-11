import { gql } from 'apollo-server-express'

export default gql`
  type Coordinate {
    latitude: Float
    longitude: Float
  }

  input CoordinateInput {
    latitude: Float
    longitude: Float
  }
`
