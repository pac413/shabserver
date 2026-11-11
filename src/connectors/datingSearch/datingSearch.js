import moment from 'moment'
import models from 'Models'
import {
  ReligiousAffiliations,
  Genders,
  ProfileStatuses,
  SiteRoles,
} from 'Models/profile/enums'
import {
  MILE_TO_METER,
  ACTIVE_PROFILES_DAYS_SINCE,
  RECENT_MEMBERSHIP_DAYS_SINCE,
} from 'Utils/globals'

const datingSearch = async (input, context) => {
  const { limit, offset, filterBy } = input
  const { activeProfileId } = context

  const matchQueries = [
    { siteRoles: SiteRoles.DATING },
    { accountStatus: ProfileStatuses.ACTIVE },
    { isMarried: false },
    {
      $or: [
        { restrictions: { $exists: false } },
        { 'restrictions.search': { $ne: true } },
      ],
    },
  ]
  let lookupStage = null
  let geoNearStage = null

  let sortByClause = { dateActive: -1 } // default sort dateActive desc

  // name filter
  if (filterBy.name) {
    if (filterBy.name.includes(' ')) {
      const [firstNameKeyword, lastNameKeyword] = filterBy.name.split(' ')
      matchQueries.push({
        firstName: { $regex: firstNameKeyword, $options: 'i' },
        lastName: { $regex: lastNameKeyword, $options: 'i' },
      })
    } else {
      matchQueries.push({
        $or: [
          { firstName: { $regex: filterBy.name, $options: 'i' } },
          { lastName: { $regex: filterBy.name, $options: 'i' } },
          { displayName: { $regex: filterBy.name, $options: 'i' } },
        ],
      })
    }
  }

  // age filter
  if (filterBy.filterAgeFrom && filterBy.filterAgeTo) {
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

  // proximity to me filter
  if (filterBy.locationMe) {
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
    // delete dateActive desc sort option as this is location based query
    delete sortByClause.dateActive
  }

  // proximity to place filter
  if (
    filterBy.locationPlace &&
    filterBy.cityRetrieved &&
    filterBy.cityCoordinate
  ) {
    const coordinate = { ...filterBy.cityCoordinate }
    const proxRadiusInMeters = filterBy.proxRadius
      ? parseInt(filterBy.proxRadius) * MILE_TO_METER
      : 0

    geoNearStage = {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [coordinate.longitude, coordinate.latitude],
        },
        distanceField: 'dist.calculated',
        spherical: true,
        ...(proxRadiusInMeters ? { maxDistance: proxRadiusInMeters } : {}),
      },
    }

    // delete dateActive desc sort option as this is location based query
    delete sortByClause.dateActive
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
        $gte: moment().subtract(RECENT_MEMBERSHIP_DAYS_SINCE, 'days').toDate(),
      },
    })
    // set createAt desc sort option for the recentMembership filter
    sortByClause = { createdAt: -1 }
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
    return sortByClause
  })()

  const profiles = await models.Profile.aggregate([
    ...aggPipelines,
    { $sort: sortStage },
    { $limit: offset + limit },
    { $skip: offset },
  ])
  return { profiles }
}

export default datingSearch
