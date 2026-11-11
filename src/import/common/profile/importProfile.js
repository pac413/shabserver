import countries from 'i18n-iso-countries'
import ct from 'countries-and-timezones'
import moment from 'moment'
import { updateProfileAvailability } from 'Connectors/profile'
import {
  getCoordinates,
  getValidEnumOrFirst,
  hasDatingProfile,
  parseMigratedDate,
  standardizeReligiousAffiliations,
} from 'Import/common/helpers'
import { importDatingProfile } from 'Import/common/datingProfile/importDatingProfile'
import { importGuestProfile } from 'Import/common/guestProfile/importGuestProfile'
import { importHostProfile } from 'Import/common/hostProfile/importHostProfile'
import { importReferences } from 'Import/common/references/importReferences'
import { importUser } from 'Import/common/user/importUser'
import models from 'Models'
import { Genders, ProfileStatuses, Title } from 'Models/profile/enums'
import { generateHandle } from 'Utils'
import { IS_MOCK_IMPORT } from 'Utils/globals'
import { importAvatar } from './importAvatar'
import { importProfilePictures } from './importProfilePictures'
import { importWallpaper } from './importWallpaper'
const occupations = require('Import/common/data/occupations.json')

const getDataItemSiteRoles = (data) => {
  if (!data.roles) {
    return []
  }

  const roles = []
  data.roles.forEach((role) => {
    const refinedRole = role.toLowerCase()

    if (['advertiser', 'tempuser'].includes(refinedRole)) {
      return
    }
    if (refinedRole === 'admin') {
      data.isAdmin = true
      return
    }

    roles.push(refinedRole)
  })

  if (
    data.datingProfile &&
    hasDatingProfile(data.datingProfile) &&
    !roles.includes('dating')
  ) {
    roles.push('dating')
  }

  return roles
}

const getOccupationIdByName = (name, occupations) => {
  const occupation = occupations.find((occupation) => {
    return occupation.name === name
  })
  if (occupation) {
    return occupation.occupationId
  }
  return null
}

const populateFieldsFromData = async (data, user, importedAt) => {
  const siteRoles = getDataItemSiteRoles(data)
  const curatedOccupationId = getOccupationIdByName(
    data.personal.occupation,
    occupations
  )
  const handle = IS_MOCK_IMPORT
    ? await generateHandle(data.firstName, data.lastName)
    : data.handle
  const countryCode =
    data.location.country === 'United States'
      ? 'US'
      : countries.getAlpha2Code(data.location.country, 'en')
  const countryTimeZones = ct.getTimezonesForCountry(countryCode)
  const timeZoneMatchingLocation = countryTimeZones
    ? countryTimeZones.find(
        (t) => !t.aliasOf && t.utcOffset === data.location.timeZone * 60
      ) || countryTimeZones[0]
    : null
  const timeZoneString = timeZoneMatchingLocation
    ? timeZoneMatchingLocation.name
    : null

  return {
    _id: data._id,
    user: user._id,
    siteRoles,
    location: {
      address: data.location.address,
      city: data.location.city,
      state: data.location.state,
      zipcode: data.location.zipcode,
      country: data.location.country,
      geoLocation: {
        type: 'Point',
        coordinates: getCoordinates(
          data.location.longitude,
          data.location.latitude
        ),
      },
      timeZone: data.location.timeZone,
      countryCode,
      timeZoneString,
    },
    email: data.email,
    phone:
      typeof data.phone === 'string'
        ? data.phone.replace(/[^+()\d]/g, '')
        : null,
    title: Object.values(Title).includes(data.title) ? data.title : undefined,
    firstName: data.firstName,
    lastName: data.lastName,
    displayName: data.displayName || `${data.firstName} ${data.lastName}`,
    handle: handle,
    birthday: parseMigratedDate(data.personal.birthday),
    age: data.personal.age,
    gender: getValidEnumOrFirst(data.personal.gender, Genders),
    organization: data.personal.organization,
    religiousAffiliation: standardizeReligiousAffiliations(
      data.personal.religiousAffiliation.toLowerCase()
    ),
    about: data.personal.about,
    isMarried: data.relationship.isMarried,
    spouse: data.relationship.spouse,
    children: data.relationship.children,
    datingAvailable: data.relationship.datingAvailable,
    hasDatingProfile: data.relationship.hasDatingProfile,
    datingProfilePrivacy: data.relationship.datingProfilePrivacy,
    datingProfilePrivate: data.relationship.datingProfilePrivate,
    occupation: curatedOccupationId ? data.personal.occupation : null,
    occupationId: curatedOccupationId || null,
    uncuratedOccupation: curatedOccupationId ? null : data.personal.occupation,
    primaryRole: data.primaryRole,
    roles: data.roles,
    dateActive: parseMigratedDate(data.dateActive),
    legacyId: data._id,
    metrics: {
      invites: data.totals.totalInvites,
      views:
        data.totals.totalProfileViews <= 100
          ? data.totals.totalProfileViews
          : 100,
    },
    accountStatus: data.accountStatus || ProfileStatuses.ACTIVE,
    createdAt: parseMigratedDate(data.dateCreated) || moment.utc().toDate(),
    updatedAt: parseMigratedDate(data.dateModified) || moment.utc().toDate(),
    importedAt,
  }
}

const findExisting = async (data) => {
  const profile = await models.Profile.findById(data._id)
  return profile
}

const create = async (data, user, importedAt) => {
  const fields = await populateFieldsFromData(data, user, importedAt)
  const profile = await models.Profile.create(fields)
  console.log({
    event: 'PROFILE',
    action: 'Created',
    message: `Created profile for ${data.email}`,
    email: data.email,
  })
  return profile
}

const update = async (data, profile, user, importedAt) => {
  const lastModified = data.dateModified ? new Date(data.dateModified) : null
  const newImportedAt = new Date(profile.importedAt || importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'PROFILE',
      action: 'Skipped',
      message: `Skipped profile for ${data.email}`,
      email: data.email,
    })
    return profile
  }

  const { _id, ...updates } = await populateFieldsFromData(
    data,
    user,
    importedAt
  )
  await models.Profile.updateOne({ _id }, updates)
  console.log({
    event: 'PROFILE',
    action: 'Updated',
    message: `Updated profile for ${data.email}`,
    email: data.email,
  })
  return profile
}

const importProfileEntity = async (data, user, importedAt) => {
  const existingProfile = await findExisting(data)
  let profile
  if (existingProfile) {
    profile = await update(data, existingProfile, user, importedAt)
  } else {
    profile = await create(data, user, importedAt)
  }

  return profile
}

export const importProfile = async (data, importedAt) => {
  console.log({
    event: 'IMPORT_PROFILE',
    message: `Started to import profile ${data._id}`,
    profileId: data._id,
    data,
  })

  const user = await importUser(data, importedAt)
  const profile = await importProfileEntity(data, user, importedAt)

  const [avatar, wallpaper] = await Promise.all([
    await importAvatar(data, profile, importedAt),
    await importWallpaper(data, profile, importedAt),
  ])

  await models.Profile.updateOne(
    { _id: profile._id },
    {
      avatar: avatar ? avatar._id : null,
      wallpaper: wallpaper ? wallpaper._id : null,
    }
  )

  await importProfilePictures(data, profile, importedAt)

  if (profile.siteRoles.includes('host') && data.hostProfile) {
    await importHostProfile(data.hostProfile, profile, importedAt)
  }
  if (profile.siteRoles.includes('guest') && data.guestProfile) {
    await importGuestProfile(data.guestProfile, profile, importedAt)
  }
  if (profile.siteRoles.includes('dating') && data.datingProfile) {
    await importDatingProfile(data.datingProfile, profile, importedAt)
  }

  // Update profile's availableOnly
  await updateProfileAvailability(profile._id)

  if (data.references && data.references.length > 0) {
    await importReferences(data.references, profile, importedAt)
  }

  console.log({
    event: 'PROFILE',
    message: `imported profile: ${profile._id} with site roles ${profile.siteRoles}`,
    profileId: profile._id,
  })

  return profile._id
}
