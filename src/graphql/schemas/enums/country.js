import { gql } from 'apollo-server-express'

export const countryCode = gql`
  enum CountryCode {
    IL
    UK
    US
  }
`
