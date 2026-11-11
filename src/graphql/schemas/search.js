import { gql } from 'apollo-server-express'

export default gql`
  enum QueryFilterBy {
    name
    location
    occupation
  }

  enum SearchFor {
    hosts
    guests
    singles
    dating
    all
  }

  enum SearchSortBy {
    dateActive
    dateCreatedDesc
    firstNameAsc
    firstNameDesc
    lastNameAsc
    lastNameDesc
    proximity
    mostInvites
    random
  }

  input SearchFilterBy {
    # narrow search filters
    peopleFilterType: String
    availableToHost: Boolean
    availableForInvites: Boolean
    ageAll: Boolean
    ageRange: Boolean
    filterAgeFrom: Int
    filterAgeTo: Int
    religionFilterType: String
    activeProfilesOnly: Boolean
    picturesOnly: Boolean
    menOnly: Boolean
    womenOnly: Boolean
    popular: Boolean
    recentMembership: Boolean
    hasEndorsements: Boolean
    locationMe: Boolean
    locationPlace: Boolean
    proxRadius: Int

    # advances search fields
    role: SearchFor
    firstName: String
    lastName: String
    occupationId: String
    coordinates: CoordinateInput
    location: String
    organization: String
  }

  input SearchInput {
    # query by
    queryBy: QueryFilterBy!

    # search for
    searchFor: SearchFor!

    # filter by
    filterBy: SearchFilterBy!

    # sort by
    sortBy: SearchSortBy

    # name
    name: String

    # occupation
    occupation: String

    # location
    location: String

    # pagination
    limit: Int!
    offset: Int!

    # user language
    language: Language!

    # returns profiles in random order
    random: Boolean
  }

  type SearchPayload {
    total: Int!
    profiles: [Profile!]!
  }

  extend type Query {
    search(input: SearchInput!): SearchPayload
  }
`
