import faker from 'faker'
import { v4 as uuid } from 'uuid'
import { parseMigratedDate } from 'Import/common/helpers'
import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const isValidData = (endorsement) => {
  return (
    validProfileIds.includes(endorsement.endorser) &&
    validProfileIds.includes(endorsement.profile)
  )
}

const populateFieldsFromData = (data, profileId, importedAt) => {
  if (IS_MOCK_IMPORT) {
    return {
      endorser: data.endorser,
      profile: profileId,
      onSiteRole: data.onSiteRole,
      body: faker.lorem.sentence(),
      importedAt,
    }
  }

  return {
    _id: uuid(),
    endorser: data.endorser,
    profile: data.profile,
    onSiteRole: data.onSiteRole,
    body: data.body,
    createdAt: parseMigratedDate(data.createdAt) || importedAt,
    updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
    importedAt,
  }
}

export const importEndorsements = async (
  endorsements,
  profileId,
  importedAt
) => {
  const validEndorsements = endorsements.filter((endorsement) =>
    isValidData(endorsement)
  )

  console.log({
    event: 'IMPORT_ENDORSEMENTS',
    message: `Importing ${validEndorsements.length}/${endorsements.length} valid endorsements for ${profileId}`,
    profileId,
  })

  await models.Endorsement.deleteMany({ profile: profileId })

  await models.Endorsement.bulkWrite(
    validEndorsements.map((data) => {
      const fields = populateFieldsFromData(data, profileId, importedAt)
      return {
        insertOne: {
          document: fields,
          timestamps: false,
        },
      }
    })
  )
}
