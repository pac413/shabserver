import { gql } from 'apollo-server-express'

export default gql`
  type HostingPartMetrics {
    night: Int
    day: Int
    third: Int
    melaveMalka: Int
    lodging: Int
  }

  type HostingMetric {
    pending: Int
    accepted: Int
    declined: Int
    parts: HostingPartMetrics
  }

  input HostingMetricsInput {
    profile: ID
    siteRole: SiteRole
    date: Date
  }

  type HostingMetricsPayload {
    hostingMetrics: HostingMetric
    partMetrics: HostingPartMetrics
  }

  extend type Query {
    hostingMetrics(input: HostingMetricsInput): HostingMetricsPayload!
  }
`
