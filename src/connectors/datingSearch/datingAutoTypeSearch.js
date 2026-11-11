import models from 'Models'
import { ProfileStatuses, SiteRoles, Genders } from 'Models/profile/enums'

async function datingAutoTypeSearch(input, { activeProfileId }) {
  const { keyword, menOnly, womenOnly, limit } = input

  const compound = {
    must: [
      {
        text: {
          path: 'siteRoles',
          query: SiteRoles.DATING,
        },
      },
      {
        text: {
          path: 'accountStatus',
          query: ProfileStatuses.ACTIVE,
        },
      },
      {
        equals: {
          path: 'isMarried',
          value: false,
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
  if (menOnly) {
    compound.must.push({
      text: {
        path: 'gender',
        query: Genders.MALE,
      },
    })
  }
  if (womenOnly) {
    compound.must.push({
      text: {
        path: 'gender',
        query: Genders.FEMALE,
      },
    })
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
        query: `(${keyword})(.*)`,
      },
    })
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
  ])

  return { profiles }
}

export default datingAutoTypeSearch
