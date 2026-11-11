export const PreferenceType = {
  search: 'search',
  dating: 'dating',
}

export const preferenceFields = {
  mode: {
    type: String,
  },
  type: {
    type: String,
  },
  name: {
    type: String,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },
  city: {
    type: String,
  },
  state: {
    type: String,
  },
  country: {
    type: String,
  },
  occupation: {
    type: String,
  },
  occupationId: {
    type: String,
  },
  organization: {
    type: String,
  },
  role: {
    type: String,
  },
  // filters
  availableToHost: {
    type: Boolean,
  },
  availableForInvites: {
    type: Boolean,
  },

  ageAll: {
    type: Boolean,
  },
  ageRange: {
    type: Boolean,
  },
  filterAgeFrom: {
    type: Number,
  },
  filterAgeTo: {
    type: Number,
  },

  activeProfilesOnly: {
    type: Boolean,
  },
  picturesOnly: {
    type: Boolean,
  },
  menOnly: {
    type: Boolean,
  },
  womenOnly: {
    type: Boolean,
  },
  popular: {
    type: Boolean,
  },
  recentMembership: {
    type: Boolean,
  },
  hasEndorsements: {
    type: Boolean,
  },

  religionFilterType: {
    type: String,
  },

  locationAll: {
    type: Boolean,
  },
  locationMe: {
    type: Boolean,
  },
  proxRadius: {
    type: Number,
  },
  locationPlace: {
    type: Boolean,
  },
  cityRetrieved: {
    type: String,
  },
  cityCoordinate: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  coordinates: {
    latitude: {
      type: Number,
    },
    longitude: {
      type: Number,
    },
  },
  location: {
    type: String,
  },

  // sort option
  sortBy: {
    type: String,
  },
}
