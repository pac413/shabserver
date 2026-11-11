import { gql } from 'apollo-server-express'

export default gql`
  type HostAvailability {
    date: Date
    status: HostProfileStatus
    reserveBy: HostReserveBy
  }

  input hostAvailabilityInput {
    profileId: ID!
    limit: Int
    date: Date
  }

  type hostAvailabilityPayload {
    availability: [HostAvailability]
  }

  extend type Query {
    hostAvailability(input: hostAvailabilityInput): hostAvailabilityPayload!
  }
`
