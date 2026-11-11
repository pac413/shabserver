import {
  getValidEnumOrUndefined,
  parseMigratedDate,
  undefinedForEmpty,
  undefinedOrLowerCase,
} from 'Import/common/helpers'
import models from 'Models'
import {
  DatingProfileBodyType,
  EthnicBackground,
  Frequency,
  Hashkafa,
  Importance,
  JewishEducation,
  SecularEducation,
} from 'Models/datingProfile/enums'

const populateFieldsFromData = (data, profile, importedAt) => {
  return {
    profile: profile._id,
    aboutMe: data.About_Me,
    lookingFor: data.Looking_For,
    primaryLanguage: undefinedForEmpty(data.Primary_Language),
    primaryPersonalityTrait: undefinedOrLowerCase(
      data.Primary_Personality_Trait
    ),
    secondaryLanguage: undefinedForEmpty(data.Secondary_Language),
    secondaryPersonalityTrait: undefinedOrLowerCase(
      data.Secondary_Personality_Trait
    ),
    torahLearning: getValidEnumOrUndefined(data.Torah_Learning, Frequency),
    amCohen: undefinedForEmpty(data.Am_Cohen),
    amConvert: undefinedForEmpty(data.Am_Convert),
    amSmoker: undefinedForEmpty(data.Am_Smoker),
    bodyType: getValidEnumOrUndefined(data.Body_Type, DatingProfileBodyType),
    datingJewishEducation: getValidEnumOrUndefined(
      data.Dating_Jewish_Education,
      JewishEducation
    ),
    datingSecularEducation: getValidEnumOrUndefined(
      data.Dating_Secular_Education,
      SecularEducation
    ),
    ethnicBackground: getValidEnumOrUndefined(
      data.Ethnic_Background,
      EthnicBackground
    ),
    hashkafa: getValidEnumOrUndefined(data.Hashkafa, Hashkafa),
    livingIsrael: getValidEnumOrUndefined(data.Living_Israel, Importance),
    locationUpbringing: undefinedForEmpty(data.Location_Upbringing),
    prayer: getValidEnumOrUndefined(data.Prayer, Frequency),
    createdAt: parseMigratedDate(data.createdAt) || importedAt,
    updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
    importedAt,
  }
}

const findExisting = async (data, profile) => {
  const datingProfile = await models.DatingProfile.findOne({
    profile: profile._id,
  })
  return datingProfile
}

const create = async (data, profile, importedAt) => {
  const fields = populateFieldsFromData(data, profile, importedAt)
  const datingProfile = await models.DatingProfile.create(fields)
  console.log({
    event: 'DATINGPROFILE',
    action: 'Created',
    message: `Created dating profile for ${profile._id}`,
    profileId: profile._id,
  })
  return datingProfile
}

const update = async (data, datingProfile, profile, importedAt) => {
  const lastModified = data.updatedAt ? new Date(data.updatedAt) : null
  const newImportedAt = new Date(importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'DATINGPROFILE',
      message: `Skipped dating profile for ${profile._id}`,
      profileId: profile._id,
    })
    return datingProfile
  }

  const { _id, ...updates } = populateFieldsFromData(data, profile, importedAt)
  await models.DatingProfile.updateOne({ _id }, updates)
  console.log({
    event: 'DATINGPROFILE',
    action: 'Updated',
    message: `Updated dating profile for ${profile._id}`,
    profileId: profile._id,
  })
  return datingProfile
}

export const importDatingProfile = async (data, profile, importedAt) => {
  console.log({
    event: 'IMPORT_DATINGPROFILE',
    message: `Importing dating profile for ${profile._id}`,
    data,
    profileId: profile._id,
  })

  const existing = await findExisting(data, profile)
  let datingProfile
  if (existing) {
    datingProfile = await update(data, existing, profile, importedAt)
  } else {
    datingProfile = await create(data, profile, importedAt)
  }

  return datingProfile
}
