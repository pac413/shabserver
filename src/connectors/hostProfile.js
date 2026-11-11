import moment from 'moment'
import { updateProfileAvailability } from 'Connectors/profile'
import hostProfileLoader from 'DataLoaders/hostProfileLoader'
import models from 'Models'
import { HostProfileStatus, HostProfileType } from 'Models/hostProfile/enums'
import { Genders, ReligiousAffiliations } from 'Models/profile/enums'
import { generateRandomFourDigits } from 'Utils/string'
import { UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'

export const regeneratePrivateInviteCode = async (input) => {
  const { profileId } = input

  const hostProfile = await models.HostProfile.findOne({
    profile: profileId,
  })
  if (!hostProfile) {
    return {
      errors: [
        new UserInputError(ERRORS_BY_CODE.NO_HOST_PROFILE_FOUND, {
          profileId,
        }),
      ],
    }
  }
  if (hostProfile.privateInviteEnabled) {
    const privateInviteCode = generateRandomFourDigits()
    await models.HostProfile.updateMany(
      { profile: profileId },
      { privateInviteCode }
    )
    return { privateInviteCode }
  }
  return {
    errors: [
      new UserInputError(ERRORS_BY_CODE.PRIVATE_INVITE_NOT_ENABLED, {
        profileId,
      }),
    ],
  }
}

export const verifyPrivateInviteCode = async (input) => {
  const { profileId, privateInviteCode } = input
  const hostProfile = await models.HostProfile.findOne({
    profile: profileId,
  })
  if (!hostProfile) {
    return {
      errors: [
        new UserInputError(ERRORS_BY_CODE.NO_HOST_PROFILE_FOUND, {
          profileId,
        }),
      ],
    }
  }
  if (hostProfile.privateInviteEnabled) {
    if (hostProfile.privateInviteCode === privateInviteCode) {
      return { isValid: true }
    }
    return { isValid: false }
  }
  return { isValid: true }
}

export const updateHostProfile = async (input) => {
  const { hostingDate, privateInviteEnabled, profileId, ...hostProfileInput } =
    input

  let hostProfile
  if (!hostingDate) {
    hostProfile = await models.HostProfile.findOneAndUpdate(
      {
        profile: profileId,
        type: HostProfileType.DEFAULT,
      },
      hostProfileInput,
      { new: true }
    )
  } else {
    const hostingDateISO = moment(hostingDate).toISOString()
    // check if there's an existing host profile for the selected date that should simply be updated.
    hostProfile = await models.HostProfile.findOneAndUpdate(
      {
        profile: profileId,
        type: HostProfileType.DATE_SPECIFIC,
        activeDates: [hostingDateISO],
      },
      hostProfileInput,
      { new: true }
    )

    if (!hostProfile) {
      // if not, upsert using defaults from default host profile
      hostProfile = await models.HostProfile.findOne({
        profile: profileId,
        type: HostProfileType.DEFAULT,
      })
      const doc = {
        profile: profileId,
        type: HostProfileType.DATE_SPECIFIC,
        activeDates: [hostingDateISO],
        ...hostProfile.toObject({
          transform: (doc, ret, options) => {
            delete ret._id
            delete ret.__v
            delete ret.importedAt
            delete ret.createdAt
            delete ret.updatedAt
            delete ret.profile
            delete ret.type
            delete ret.activeDates
            return ret
          },
        }),
        ...hostProfileInput,
      }

      hostProfile = await models.HostProfile.findOneAndUpdate(
        {
          profile: profileId,
          type: HostProfileType.DATE_SPECIFIC,
          activeDates: [hostingDateISO],
        },
        doc,
        { new: true, upsert: true, setDefaultsOnInsert: true }
      )
    }
  }
  if (
    typeof privateInviteEnabled === 'boolean' &&
    hostProfile.privateInviteEnabled !== privateInviteEnabled
  ) {
    if (privateInviteEnabled) {
      await models.HostProfile.updateMany(
        { profile: profileId },
        {
          privateInviteEnabled,
          privateInviteCode: generateRandomFourDigits(),
        }
      )
    } else {
      await models.HostProfile.updateMany(
        { profile: profileId },
        {
          privateInviteEnabled,
          privateInviteCode: null,
        }
      )
    }
    hostProfile = await models.HostProfile.findById(hostProfile._id).lean()
  }
  // Reset HostProfileLoader for next load
  hostProfileLoader.clear(profileId)
  // Update Profile's availableOnly
  await updateProfileAvailability(profileId)
  return hostProfile
}

export const getStatus = async (hostProfile, activeProfileId) => {
  const activeProfile = await models.Profile.findById(activeProfileId).lean()

  const guestProfile = await models.GuestProfile.find({
    profile: activeProfileId,
  })

  return unavailableToHost(hostProfile, guestProfile, activeProfile)
    ? HostProfileStatus.UNAVAILABLE
    : hostProfile.status
}

const unavailableToHost = (hostProfile, guestProfile, profile) => {
  if (profile.children || profile.isMarried) {
    // if a family
    if (hostProfile.hostFamiliesWithChildren === false) {
      return true
    }
  } else {
    // if single
    if (profile.gender === Genders.MALE && !hostProfile.hostMen) {
      return true
    }
    if (profile.gender === Genders.FEMALE && !hostProfile.hostWomen) {
      return true
    }
  }
  if (
    profile.religiousAffiliation === ReligiousAffiliations.ORTHODOX &&
    !hostProfile.hostAffiliatedJews
  ) {
    return true
  }

  return false
}

export async function deleteHostProfiles(profileId, shouldHardDelete = false) {
  const whereOptions = { profile: profileId }
  if (shouldHardDelete) {
    await models.HostProfile.deleteMany(whereOptions)
  } else {
    await models.HostProfile.delete(whereOptions).exec()
  }
}

export async function restoreHostProfiles(profileId) {
  const whereOptions = { profile: profileId }
  await models.HostProfile.restore(whereOptions).exec()
}
