import { getAvatar, getAge, getLocationString } from 'Connectors/profile'
import { getMutualFriendProfileCount } from 'Connectors/friends'
import models from 'Models'
import { MatchParty } from 'Models/datingMatch/enums'
import { SiteRoles } from 'Models/profile/enums'
import { THUMBNAILS } from 'Utils/globals'
import { getLanguageName } from 'Utils/i18n'
import { v4 as uuid } from 'uuid'
import { calculateAge, getProfileUrl } from './profile'

export const prepareRequestEmailTemplate = async (recipientId, requestorId) => {
  const [recipient, requestor] = await fetchProfiles([recipientId, requestorId])

  return {
    // Requester Data
    requestorId,
    requestorFullName: `${requestor.firstName} ${requestor.lastName}`,
    requestorProfileUrl: getProfileUrl(requestor),
    requestorAvatarUrl: await getAvatar(requestor, THUMBNAILS.SMALL),

    // Recipient Data
    profileId: recipientId,
    profileFirstName: recipient.firstName,
    profileEmail: recipient.email,
    mutualFriendsAmount: await getMutualFriendProfileCount({
      activeProfileId: requestorId,
      profileId: recipientId,
    }),
  }
}

export const prepareAcceptRequestEmailTemplate = async (
  profileId,
  requestorId
) => {
  const [profile, requestor] = await fetchProfiles([profileId, requestorId])

  return {
    requestorEmail: requestor.email,
    requestorFirstName: requestor.firstName,
    profileFirstName: profile.firstName,
    profileMutualFriends: await getMutualFriendProfileCount({
      activeProfileId: requestorId,
      profileId,
    }),
    profileAvatarUrl: await getAvatar(profile, THUMBNAILS.MEDIUM),
    profileProfileUrl: getProfileUrl(profile),
  }
}

export const prepareDataForDownloadableDatingProfileTemplate = async (
  profileId,
  requestorId
) => {
  const [profile, requestor] = await fetchProfiles([profileId, requestorId])
  const [datingProfile] = await fetchDatingProfiles([profileId])

  // composign prospectProfileData
  const prospectProfileData = await getProspectProfileData(profile)

  return {
    requestorEmail: requestor.email,
    requestorFirstName: requestor.firstName,
    ProspectDatingProfile: {
      ...datingProfile,
      age: calculateAge(profile.birthday),
      primaryLanguage: getLanguageName(datingProfile.primaryLanguage),
      secondaryLanguage: getLanguageName(datingProfile.secondaryLanguage),
    },
    ProspectProfileData: prospectProfileData,
  }
}

export const prepareDataForMatchmakingTemplate = async (
  matchmakerId,
  guyId,
  girlId,
  message,
  party
) => {
  const [matchmakerProfile, guyProfile, girlProfile] = await fetchProfiles([
    matchmakerId,
    guyId,
    girlId,
  ])
  const [guyDatingProfile, girlDatingProfile] = await fetchDatingProfiles([
    guyId,
    girlId,
  ])

  // composing guyProfileData, girlProfileData
  const [guyProfileData, girlProfileData] = await Promise.all([
    getProspectProfileData(guyProfile),
    getProspectProfileData(girlProfile),
  ])

  // calculating party notification
  let MatchPartyNotification = 2
  switch (party) {
    case MatchParty.GIRL:
      MatchPartyNotification = 0
      break
    case MatchParty.GUY:
      MatchPartyNotification = 1
      break
    case MatchParty.BOTH:
    default:
      MatchPartyNotification = 2
      break
  }

  return {
    matchmakerFullName: `${matchmakerProfile.firstName} ${matchmakerProfile.lastName}`,
    message,
    guyProfileData,
    guyDatingProfile,
    girlProfileData,
    girlDatingProfile,
    MatchPartyNotification,
  }
}

export const prepareCommonProfileEmailTemplate = async (profileId) => {
  const [profile] = await fetchProfiles([profileId])

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    location: getLocationString(profile),
    avatarUrl: await getAvatar(profile, THUMBNAILS.MEDIUM),
    profileUrl: getProfileUrl(profile),
  }
}

async function fetchProfiles(profiles) {
  const results = await Promise.all(
    profiles.map((profileId) => models.Profile.findById(profileId))
  )

  const missingProfileId = results.findIndex((result) => !result)
  if (~missingProfileId) {
    throw new Error(`Cannot find profile "${profiles[missingProfileId]}"`)
  }

  return results
}

async function fetchDatingProfiles(profileIds) {
  const results = await Promise.all(
    profileIds.map((profileId) =>
      models.DatingProfile.findOne({ profile: profileId }).lean()
    )
  )

  const missingDatingProfileIndex = results.findIndex((result) => !result)
  if (~missingDatingProfileIndex) {
    throw new Error(
      `Cannot find dating profile for "${profileIds[missingDatingProfileIndex]}"`
    )
  }

  return results
}

async function getProspectProfileData(profile) {
  // If occupation is null, we need to use uncuratedOccupation instead
  let occupation = profile.occupation
  if (!occupation) {
    occupation = profile.uncuratedOccupation
  }

  // Getting dating references
  const datingReferences = await models.Reference.find({
    profile: profile.id,
    siteRole: SiteRoles.DATING,
  }).lean()

  datingReferences.forEach((reference) => {
    if (reference.relationship) {
      reference.relationship = reference.relationship.join(', ')
    }
  })

  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    email: profile.email,
    avatarUrl: await getAvatar(profile, THUMBNAILS.MEDIUM),
    profileUrl: getProfileUrl(profile),
    age: getAge(profile),
    location: getLocationString(profile, false),
    religousAffiliation: profile.religiousAffiliation,
    gender: profile.gender,
    occupation,
    datingProspectReferences: datingReferences,
  }
}

export function generateNoReplyEmail() {
  const identifier = uuid()
  return `noemail+${identifier}@shabbat.com`
}
