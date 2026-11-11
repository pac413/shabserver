import { gql } from 'apollo-server-express'

export default gql`
  type HostingDate {
    date: Date!
    hebrewDate: String
    englishHebrewDate: String
    type: HostingDateType
    description: String
    hebrewDescription: String
    local: CountryCode
  }

  input HostingDateInput {
    date: Date
  }

  type HostingDatePayload {
    hostingDate: HostingDate
  }

  input HostingDatesInput {
    date: Date
    limit: Int
    local: CountryCode
  }

  type HostingDatesPayload {
    hostingDates: [HostingDate]
    upcomingInx: Int
  }

  extend type Query {
    hostingDate(input: HostingDateInput): HostingDatePayload
    hostingDates(input: HostingDatesInput): HostingDatesPayload
  }
`
