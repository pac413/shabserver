import { gql } from 'apollo-server-express'

// TODO:
// we need to remove currentCoordinate once authentication is
// fully done and we can get the profile location

export default gql`
  input DatingSearchFilterBy {
    ageAll: Boolean
    ageRange: Boolean
    filterAgeFrom: Int
    filterAgeTo: Int
    religionFilterType: String
    locationAll: Boolean
    locationMe: Boolean
    locationPlace: Boolean
    cityRetrieved: String
    cityCoordinate: CoordinateInput
    proxRadius: Int
    activeProfilesOnly: Boolean
    picturesOnly: Boolean
    menOnly: Boolean
    womenOnly: Boolean
    name: String
    recentMembership: Boolean
    hasEndorsements: Boolean
  }

  input DatingSearchInput {
    # filter by
    filterBy: DatingSearchFilterBy!

    # pagination
    limit: Int!
    offset: Int!
  }

  extend type Query {
    datingSearch(input: DatingSearchInput!): ProfilesPayload
  }
`
