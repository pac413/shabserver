import { gql } from 'apollo-server-express'

export const flags = gql`
  enum FlagCode {
    UNVERIFIED_EMAIL
    UNVERIFIED_ADDRESS
    INCOMPLETE_ADDRESS
    MISSING_PHONE_NUMBER
    MISSING_AGE
  }

  enum FlagScope {
    PROFILE
    HOSTING
    DATING
  }
`
