import faker from 'faker'
import { parseMigratedDate } from 'Import/common/helpers'
import models from 'Models'
import { GuestProfileStatus } from 'Models/guestProfile/enums'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const populateFieldsFromData = (data, profile, importedAt) => {
  return IS_MOCK_IMPORT
    ? {
        profile: profile._id,
        status: faker.random.arrayElement(Object.values(GuestProfileStatus)),
        importedAt,
      }
    : {
        profile: profile._id,
        status: data.status,
        createdAt: parseMigratedDate(data.createdAt) || importedAt,
        updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
        importedAt,
      }
}

const findExisting = async (data, profile) => {
  const guestProfile = await models.GuestProfile.findOne({
    profile: profile._id,
  })
  return guestProfile
}

const create = async (data, profile, importedAt) => {
  const fields = populateFieldsFromData(data, profile, importedAt)
  const guestProfile = await models.GuestProfile.create(fields)
  console.log({
    event: 'GUESTPROFILE',
    action: 'Created',
    message: `Created guest profile for ${profile._id}`,
    profileId: profile._id,
  })
  return guestProfile
}

const update = async (data, guestProfile, profile, importedAt) => {
  const lastModified = data.updatedAt ? new Date(data.updatedAt) : null
  const newImportedAt = new Date(importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'GUESTPROFILE',
      action: 'Skipped',
      message: `Skipped guest profile for ${profile._id}`,
      profileId: profile._id,
    })
    return guestProfile
  }

  const { _id, ...updates } = populateFieldsFromData(data, profile, importedAt)
  await models.GuestProfile.updateOne({ _id }, updates)
  console.log({
    event: 'GUESTPROFILE',
    action: 'Updated',
    message: `Updated guest profile for ${profile._id}`,
    profileId: profile._id,
  })
  return guestProfile
}

export const importGuestProfile = async (data, profile, importedAt) => {
  console.log({
    event: 'IMPORT_GUESTPROFILE',
    message: `Importing guest profile ${profile._id}`,
    profileId: profile._id,
    data,
  })

  const existing = await findExisting(data, profile)
  let guestProfile
  if (existing) {
    guestProfile = await update(data, existing, profile, importedAt)
  } else {
    guestProfile = await create(data, profile, importedAt)
  }

  return guestProfile
}
