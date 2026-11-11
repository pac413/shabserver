import faker from 'faker'
import { parseMigratedDate } from 'Import/common/helpers'
import models from 'Models'
import {
  HostProfileReserveBy,
  HostProfileStatus,
} from 'Models/hostProfile/enums'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const populateFieldsFromData = (data, profile, importedAt) => {
  return IS_MOCK_IMPORT
    ? {
        profile: profile._id,
        reserveBy: HostProfileReserveBy.THURSDAY,
        status: HostProfileStatus.ACTIVELY_LOOKING,
        canHostMeals: true,
        mealAmount: 4,
        canHostSleep: false,
        sleepAmount: 2,
        hostMen: faker.datatype.boolean(),
        hostWomen: faker.datatype.boolean(),
        hostFamiliesWithChildren: faker.datatype.boolean(),
        hostAffiliatedJews: faker.datatype.boolean(),
        hostUnAffiliatedJews: faker.datatype.boolean(),
        importedAt,
      }
    : {
        profile: profile._id,
        status: data.status,
        reserveBy: data.reserveBy,
        canHostMeals: data.canHostMeals,
        mealAmount: data.mealAmount,
        canHostSleep: data.canHostSleep,
        sleepAmount: data.sleepAmount,
        hostMen: data.hostMen,
        hostWomen: data.hostWomen,
        hostFamiliesWithChildren: data.hostFamiliesWithChildren,
        hostAffiliatedJews: data.hostAffiliatedJews,
        hostUnAffiliatedJews: data.hostUnAffiliatedJews,
        showGuestList: data.showGuestList,
        createdAt: parseMigratedDate(data.createdAt) || importedAt,
        updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
        importedAt,
      }
}

const findExisting = async (data, profile) => {
  const hostProfile = await models.HostProfile.findOne({
    profile: profile._id,
  })
  return hostProfile
}

const create = async (data, profile, importedAt) => {
  const fields = populateFieldsFromData(data, profile, importedAt)
  const hostProfile = await models.HostProfile.create(fields)
  console.log({
    event: 'HOSTPROFILE',
    action: 'Created',
    message: `Created host profile for ${profile._id}`,
    profileId: profile._id,
  })
  return hostProfile
}

const update = async (data, hostProfile, profile, importedAt) => {
  const lastModified = data.updatedAt ? new Date(data.updatedAt) : null
  const newImportedAt = new Date(importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'HOSTPROFILE',
      action: 'Skipped',
      message: `Skipped host profile for ${profile._id}`,
      profileId: profile._id,
    })
    return hostProfile
  }

  const { _id, ...updates } = populateFieldsFromData(data, profile, importedAt)
  await models.HostProfile.updateOne({ _id }, updates)
  console.log({
    event: 'HOSTPROFILE',
    action: 'Updated',
    message: `Updated host profile for ${profile._id}`,
    profileId: profile._id,
  })
  return hostProfile
}

export const importHostProfile = async (data, profile, importedAt) => {
  console.log({
    event: 'IMPORT_HOSTPROFILE',
    message: `Importing host profile  ${profile._id}`,
    profileId: profile._id,
    data,
  })

  const existing = await findExisting(data, profile)
  let hostProfile
  if (existing) {
    hostProfile = await update(data, existing, profile, importedAt)
  } else {
    hostProfile = await create(data, profile, importedAt)
  }

  return hostProfile
}
