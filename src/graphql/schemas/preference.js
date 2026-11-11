import { gql } from 'apollo-server-express'

export default gql`
  type Preference {
    type: SearchFor
    name: String
    city: String
    state: String
    country: String
    occupation: String
    location: String
    role: String
    availableToHost: Boolean
    availableForInvites: Boolean
    ageAll: Boolean
    ageRange: Boolean
    filterAgeFrom: Int
    filterAgeTo: Int
    activeProfilesOnly: Boolean
    picturesOnly: Boolean
    menOnly: Boolean
    womenOnly: Boolean
    popular: Boolean
    recentMembership: Boolean
    hasEndorsements: Boolean
    religionFilterType: String
    locationAll: Boolean
    locationMe: Boolean
    proxRadius: Int
    locationPlace: Boolean
    cityRetrieved: String
    cityCoordinate: Coordinate
    coordinates: Coordinate
    sortBy: SearchSortBy
  }

  enum PreferenceType {
    search
    dating
  }

  input PreferenceInput {
    type: SearchFor
    name: String
    firstName: String
    lastName: String
    city: String
    state: String
    country: String
    occupation: String
    occupationId: String
    location: String
    organization: String
    role: String
    availableToHost: Boolean
    availableForInvites: Boolean
    ageAll: Boolean
    ageRange: Boolean
    filterAgeFrom: Int
    filterAgeTo: Int
    activeProfilesOnly: Boolean
    picturesOnly: Boolean
    menOnly: Boolean
    womenOnly: Boolean
    popular: Boolean
    recentMembership: Boolean
    hasEndorsements: Boolean
    religionFilterType: String
    locationAll: Boolean
    locationMe: Boolean
    proxRadius: Int
    locationPlace: Boolean
    cityRetrieved: String
    cityCoordinate: CoordinateInput
    coordinates: CoordinateInput
    sortBy: SearchSortBy
  }

  input SetPreferenceInput {
    type: PreferenceType!
    preference: PreferenceInput
  }

  extend type Mutation {
    setPreference(input: SetPreferenceInput!): ProfilePayload!
  }
`
