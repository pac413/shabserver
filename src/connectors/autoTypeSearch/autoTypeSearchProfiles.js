import { simpleProfileSelector } from 'DataLoaders/simpleProfileLoader'
import models from 'Models'
import { ProfileStatuses, SiteRoles } from 'Models/profile/enums'

const SearchForValues = Object.freeze({
  HOSTS: 'hosts',
  GUESTS: 'guests',
  SINGLE: 'dating',
  ALL: 'all',
})

export async function autoTypeSearchProfiles(input, { activeProfileId }) {
  const { keyword, limit, searchFor } = input

  const compound = {
    must: [
      {
        text: {
          path: 'accountStatus',
          query: ProfileStatuses.ACTIVE,
        },
      },
      {
        near: {
          origin: new Date(),
          path: 'dateActive',
          pivot: 604800000, // 604800000 ms = 1 week
        },
      },
    ],
    mustNot: [
      {
        text: {
          path: '_id',
          query: activeProfileId,
        },
      },
      {
        equals: {
          path: 'restrictions.search',
          value: true,
        },
      },
    ],
  }

  // For now, we support up to 2 terms separted by space
  const [firstNameKeyword, lastNameKeyword] = keyword.split(' ')
  if (lastNameKeyword) {
    compound.must.push(
      {
        regex: {
          path: 'firstName',
          allowAnalyzedField: true,
          query: `(${firstNameKeyword})(.*)`,
        },
      },
      {
        regex: {
          path: 'lastName',
          allowAnalyzedField: true,
          query: `(${lastNameKeyword})(.*)`,
        },
      }
    )
  } else {
    compound.must.push({
      regex: {
        path: ['firstName', 'lastName', 'displayName'],
        allowAnalyzedField: true,
        query: `(${firstNameKeyword})(.*)`,
      },
    })
  }

  // Analyse searchFor
  if (searchFor) {
    switch (searchFor) {
      case SearchForValues.GUESTS:
        compound.must.push({
          text: {
            path: 'siteRoles',
            query: SiteRoles.GUEST,
          },
        })
        break
      case SearchForValues.HOSTS:
        compound.must.push({
          text: {
            path: 'siteRoles',
            query: SiteRoles.HOST,
          },
        })
        break
      case SearchForValues.SINGLE:
        compound.must.push({
          text: {
            path: 'siteRoles',
            query: SiteRoles.DATING,
          },
        })
        break
      default:
        break
    }
  }
  const profiles = await models.Profile.aggregate([
    {
      $search: {
        index: 'autoTypeSearch',
        compound,
      },
    },
    {
      $limit: limit,
    },
    {
      $project: simpleProfileSelector,
    },
  ])

  return profiles
}
