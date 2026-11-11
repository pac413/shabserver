import faker from 'faker'
import { uniqWith } from 'lodash'
import { parseMigratedDate } from 'Import/common/helpers'
import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const isValidData = (data) => {
  return validProfileIds.includes(data.viewer)
}

const populateFieldsFromData = (data, profileId, importedAt) => {
  if (IS_MOCK_IMPORT) {
    return {
      viewer: data.viewer,
      viewed: profileId,
      browser: 'Faker',
      dateViewed: faker.date.past(1),
      anonymous: false,
      importedAt,
    }
  }

  return {
    _id: data._id,
    viewer: data.viewer,
    viewed: data.viewed,
    browser: data.browser,
    dateViewed: parseMigratedDate(data.createdAt) || importedAt,
    anonymous: false,
    createdAt: parseMigratedDate(data.createdAt) || importedAt,
    updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
    importedAt,
  }
}

const removeOldProfileViews = async (profileViews, profileId, importedAt) => {
  await models.ProfileView.deleteMany({
    _id: { $nin: profileViews.map((ref) => ref._id) },
    viewed: profileId,
    importedAt: {
      $exists: true,
      $gt: new Date(importedAt),
    },
  })
}

export const importProfileViews = async (
  profileViews,
  profileId,
  importedAt
) => {
  const validProfileViews = uniqWith(
    profileViews.filter((view) => isValidData(view)),
    (a, b) => a.viewer === b.viewer && a.viewed === b.viewed
  )
  console.log({
    event: 'IMPORT_PROFILEVIEWS',
    message: `Importing ${validProfileViews.length} / ${profileViews.length} profile views for ${profileId}`,
    profileId,
  })

  await removeOldProfileViews(validProfileViews, profileId, importedAt)
  await models.ProfileView.bulkWrite(
    validProfileViews.map((data) => {
      const fields = populateFieldsFromData(data, profileId, importedAt)
      return {
        replaceOne: {
          filter: {
            viewer: fields.viewer,
            viewed: fields.viewed,
          },
          replacement: fields,
          upsert: true,
          timestamps: false,
        },
      }
    })
  )
}
