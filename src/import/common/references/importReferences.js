import faker from 'faker'
import validator from 'validator'
import { parseMigratedDate } from 'Import/common/helpers'
import models from 'Models'
import { ReferenceRelationship } from 'Models/reference/enums'
import { IS_MOCK_IMPORT } from 'Utils/globals'
import { validatePhoneNumber } from 'Utils/phone'

const isValidData = (ref) => {
  const isValidEmail = !ref.email || validator.isEmail(ref.email)
  let isValidPhone = true

  if (ref.phone) {
    isValidPhone = validatePhoneNumber(ref.phone)
  }

  return (
    isValidEmail &&
    isValidPhone &&
    (ref.email || ref.phone) &&
    ref.siteRoles &&
    ref.siteRoles.length > 0
  )
}

const populateFieldsFromData = (data, profile, importedAt) => {
  if (IS_MOCK_IMPORT) {
    return {
      profile: profile._id,
      name: faker.name.findName(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumberFormat(),
      relationship: [
        faker.random.arrayElement(Object.values(ReferenceRelationship)),
      ],
      siteRole: profile.siteRoles[0],
      importedAt,
    }
  }

  return {
    _id: data._id,
    profile: profile._id,
    name: data.name,
    email: data.email,
    phone:
      typeof data.phone === 'string'
        ? data.phone.replace(/[^+()\d]/g, '')
        : null,
    relationship: [data.relationship.relationship],
    siteRole: profile.siteRoles[0],
    createdAt: parseMigratedDate(data.createdAt) || importedAt,
    updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
    importedAt,
  }
}

const removeOldReferences = async (references, profile, importedAt) => {
  await models.Reference.deleteMany({
    profile: profile._id,
    importedAt: {
      $exists: true,
      $gt: new Date(importedAt),
    },
  })
}

export const importReferences = async (references, profile, importedAt) => {
  const validReferences = references.filter((ref) => isValidData(ref))

  console.log({
    event: 'IMPORT_REFERENCES',
    message: `Importing ${validReferences.length}/${references.length} references for ${profile._id}`,
    profileId: profile._id,
  })

  await removeOldReferences(validReferences, profile, importedAt)
  await models.Reference.bulkWrite(
    validReferences.map((data) => {
      const fields = populateFieldsFromData(data, profile, importedAt)
      return {
        replaceOne: {
          filter: {
            _id: fields._id,
          },
          replacement: fields,
          upsert: true,
          timestamps: false,
        },
      }
    })
  )
}
