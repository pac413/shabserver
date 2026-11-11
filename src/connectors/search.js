import escapeRegex from 'escape-string-regexp'
import moment from 'moment'
import models from 'Models'
import {
  ReligiousAffiliations,
  Genders,
  ProfileStatuses,
  SiteRoles,
} from 'Models/profile/enums'
import { getLocationGeocode } from 'Services/location'
import {
  ACTIVE_PROFILES_DAYS_SINCE,
  RECENT_MEMBERSHIP_DAYS_SINCE,
  MILE_TO_METER,
} from 'Utils/globals'

const QueryByValues = Object.freeze({
  NAME: 'name',
  LOCATION: 'location',
  OCCUPATION: 'occupation',
})

const SearchForValues = Object.freeze({
  HOSTS: 'hosts',
  GUESTS: 'guests',
  SINGLE: 'dating',
  ALL: 'all',
})

const SortByValues = Object.freeze({
  DATE_ACTIVE_DESC: 'dateActiveDesc',
  DATE_CREATED_DESC: 'dateCreatedDesc',
  FIRST_NAME_ASC: 'firstNameAsc',
  FIRST_NAME_DESC: 'firstNameDesc',
  LAST_NAME_ASC: 'lastNameAsc',
  LAST_NAME_DESC: 'lastNameDesc',
  PROXIMITY: 'proximity',
  MOST_INVITES: 'mostInvites',
  RANDOM: 'random',
})

function getRoleId(role) {
  switch (role) {
    case SearchForValues.GUESTS:
      return SiteRoles.GUEST
    case SearchForValues.HOSTS:
      return SiteRoles.HOST
    case SearchForValues.SINGLE:
      return SiteRoles.DATING
    default:
      return null
  }
}

async function findProfiles(pipelines, sortStage, limit, offset) {
  const [[countAgg], profiles] = await Promise.all([
    models.Profile.aggregate([...pipelines, { $count: 'total' }]),
    models.Profile.aggregate([
      ...pipelines,
      ...(sortStage ? [{ $sort: sortStage }] : []),
      { $limit: offset + limit },
      { $skip: offset },
    ]),
  ])
  return { total: countAgg?.total || 0, profiles }
}

async function findRandomProfiles(pipelines, limit) {
  const [[countAgg], profiles] = await Promise.all([
    models.Profile.aggregate([...pipelines, { $count: 'total' }]),
    models.Profile.aggregate([...pipelines, { $sample: { size: limit } }]),
  ])
  return { total: countAgg?.total || 0, profiles }
}

function prepareSortStage(sortBy) {
  const sortByFieldMapping = {
    proximity: 'dist.calculated', // 'dist.calculated' field will be added with the initial aggregate stage
    mostInvites: 'metrics.invites',
    firstNameAsc: 'firstName',
    firstNameDesc: 'firstName',
    lastNameAsc: 'lastName',
    lastNameDesc: 'lastName',
    dateActiveDesc: 'dateActive',
    dateCreatedDesc: 'createdAt',
  }

  if (!sortBy || sortBy === SortByValues.PROXIMITY) {
    return null
  }

  const sortByClause = {}
  if (
    sortBy === SortByValues.FIRST_NAME_DESC ||
    sortBy === SortByValues.LAST_NAME_DESC ||
    sortBy === SortByValues.DATE_CREATED_DESC ||
    sortBy === SortByValues.DATE_ACTIVE_DESC
  ) {
    sortByClause[sortByFieldMapping[sortBy]] = -1
  } else {
    sortByClause[sortByFieldMapping[sortBy]] = 1
  }
  return sortByClause
}

async function getLocationBasedOnParams(location) {
  // try to extract the location from the query
  if (location) {
    const formattedLocation = location.replace(/\//g, ' ')
    const locationResult = await getLocationGeocode(formattedLocation)
    if (locationResult) {
      return {
        geoLocation: {
          coordinates: [locationResult.longitude, locationResult.latitude],
        },
      }
    }
  }
}

export const search = async (input, activeProfileId) => {
  const matchQueries = [
    { accountStatus: ProfileStatuses.ACTIVE },
    { _id: { $ne: activeProfileId } },
    {
      $or: [
        { restrictions: { $exists: false } },
        { 'restrictions.search': { $ne: true } },
      ],
    },
  ]
  let lookupStage = null
  let geoNearStage = null

  const {
    queryBy,
    searchFor,
    filterBy,
    name = '',
    occupation: occupationQuery,
    location: locationQuery,
    limit,
    offset,
    language,
  } = input
  let { sortBy } = input

  // location based query
  const location = await getLocationBasedOnParams(locationQuery)
  if (location && location.geoLocation && location.geoLocation.coordinates) {
    geoNearStage = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: location.geoLocation.coordinates,
        },
        distanceField: 'dist.calculated',
        spherical: true,
      },
    }
  }

  // check queryBy
  if (queryBy) {
    if (queryBy === QueryByValues.NAME) {
      if (name) {
        const sanitizedQuery = escapeRegex(name)
        const startWithRegex = new RegExp('^' + sanitizedQuery, 'i')
        matchQueries.push({
          $or: [
            { firstName: startWithRegex },
            { lastName: startWithRegex },
            { displayName: startWithRegex },
          ],
        })
      }
      if (!sortBy) {
        // Apply default sort option as dateActive desc
        sortBy = SortByValues.DATE_ACTIVE_DESC
      }
    }

    if (queryBy === QueryByValues.OCCUPATION) {
      const occupation = await models.Occupation.findOne({
        lang: language,
        name: occupationQuery,
      })
      if (occupation) {
        matchQueries.push({
          occupationId: occupation.occupationId.toString(),
        })
      }
    }
  }

  // check filterBy
  if (filterBy) {
    // invite
    if (filterBy.availableToHost && filterBy.availableForInvites) {
      matchQueries.push({
        $or: [{ 'availableOnly.guest': true }, { 'availableOnly.host': true }],
      })
    } else if (filterBy.availableToHost) {
      matchQueries.push({
        'availableOnly.host': true,
      })
    } else if (filterBy.availableForInvites) {
      matchQueries.push({
        'availableOnly.guest': true,
      })
    }

    // age filter
    if (filterBy.ageRange) {
      const fromAge = filterBy.filterAgeFrom
      const toAge = filterBy.filterAgeTo

      matchQueries.push({
        birthday: {
          $gte: moment().subtract(toAge, 'years').toDate(),
          $lte: moment().subtract(fromAge, 'years').toDate(),
        },
      })
    }

    // religeous affiliation filter
    if (filterBy.religionFilterType) {
      switch (filterBy.religionFilterType) {
        case 'ALL':
          break
        case 'NON-ORTHODOX':
          matchQueries.push({
            religiousAffiliation: {
              $ne: ReligiousAffiliations.ORTHODOX,
            },
          })
          break
        default:
          matchQueries.push({
            religiousAffiliation:
              ReligiousAffiliations[filterBy.religionFilterType],
          })
          break
      }
    }

    // other filter
    if (filterBy.activeProfilesOnly) {
      matchQueries.push({
        dateActive: {
          $gte: moment().subtract(ACTIVE_PROFILES_DAYS_SINCE, 'days').toDate(),
        },
      })
    }
    if (filterBy.picturesOnly) {
      matchQueries.push({
        avatar: {
          $exists: true,
          $nin: [null, ''],
        },
      })
    }
    if (filterBy.menOnly) {
      matchQueries.push({
        gender: Genders.MALE,
      })
    }
    if (filterBy.womenOnly) {
      matchQueries.push({
        gender: Genders.FEMALE,
      })
    }

    if (filterBy.recentMembership) {
      matchQueries.push({
        createdAt: {
          $gte: moment()
            .subtract(RECENT_MEMBERSHIP_DAYS_SINCE, 'days')
            .toDate(),
        },
      })
      // Apply sort option as createdAt desc
      sortBy = SortByValues.DATE_CREATED_DESC
    }

    if (filterBy.hasEndorsements) {
      lookupStage = {
        $lookup: {
          from: 'endorsements',
          let: {
            profileId: '$_id',
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ['$profile', '$$profileId'],
                },
                deleted: false,
              },
            },
          ],
          as: 'endorsements',
        },
      }
      matchQueries.push({
        endorsements: { $exists: true, $not: { $size: 0 } },
      })
    }

    // Remove the legacy conditional when mobile app is updated: sortBy === SortByValues.PROXIMITY
    if (filterBy.locationMe || sortBy === SortByValues.PROXIMITY) {
      const activeProfile = await models.Profile.findById(activeProfileId)
        .select({ location: 1 })
        .lean()
      const coordinates = activeProfile.location.geoLocation.coordinates
      const proxRadiusInMeters = filterBy.proxRadius
        ? parseInt(filterBy.proxRadius) * MILE_TO_METER
        : 0

      geoNearStage = {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates,
          },
          distanceField: 'dist.calculated',
          spherical: true,
          ...(proxRadiusInMeters ? { maxDistance: proxRadiusInMeters } : {}),
        },
      }
    }

    // Remove the legacy conditional when mobile app is updated: filterBy.coordinates
    if (
      (filterBy.locationPlace && filterBy.coordinates) ||
      filterBy.coordinates
    ) {
      const proxRadiusInMeters = filterBy.proxRadius
        ? parseInt(filterBy.proxRadius) * MILE_TO_METER
        : 0

      geoNearStage = {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [
              filterBy.coordinates.longitude,
              filterBy.coordinates.latitude,
            ],
          },
          distanceField: 'dist.calculated',
          spherical: true,
          ...(proxRadiusInMeters ? { maxDistance: proxRadiusInMeters } : {}),
        },
      }
    }

    // ADVANCES SEARCH FIELDS
    if (filterBy.role) {
      matchQueries.push({
        siteRoles: getRoleId(filterBy.role),
      })
    }

    if (filterBy.firstName) {
      matchQueries.push({
        firstName: filterBy.firstName,
      })
    }

    if (filterBy.lastName) {
      matchQueries.push({
        lastName: filterBy.lastName,
      })
    }

    if (filterBy.organization) {
      matchQueries.push({
        organization: filterBy.organization,
      })
    }

    if (filterBy.occupationId) {
      matchQueries.push({
        occupationId: filterBy.occupationId.toString(),
      })
    }
  }

  // check searchFor
  if (searchFor) {
    switch (searchFor) {
      case SearchForValues.GUESTS:
        matchQueries.push({
          siteRoles: SiteRoles.GUEST,
        })
        break
      case SearchForValues.HOSTS:
        matchQueries.push({
          siteRoles: SiteRoles.HOST,
        })
        break
      case SearchForValues.SINGLE:
        matchQueries.push({
          siteRoles: SiteRoles.DATING,
        })
        break
      default:
        break
    }
  }

  // Prepare aggregation pipelines. geoNear pipeline should be always first stage if exists
  const aggPipelines = [
    ...(geoNearStage ? [geoNearStage] : []),
    ...(lookupStage ? [lookupStage] : []),
    {
      $match: {
        $and: matchQueries,
      },
    },
  ]

  // Prepare aggregation sort stage
  const sortStage = (() => {
    // If geoNear stage exists, we should first sort by dist.calculated
    if (geoNearStage) {
      return { 'dist.calculated': 1, createdAt: -1 }
    }
    return prepareSortStage(sortBy)
  })()

  const { total, profiles } =
    sortBy === SortByValues.RANDOM
      ? await findRandomProfiles(aggPipelines, limit)
      : await findProfiles(aggPipelines, sortStage, limit, offset)
  return { total, profiles }
}
