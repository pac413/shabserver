import { updateProfileAvailability } from 'Connectors/profile'
import guestProfileLoader from 'DataLoaders/guestProfileLoader'
import models from 'Models'

export const updateGuestProfile = async (input, { role, activeProfileId }) => {
  const { profileId, ...guestProfileInput } = input
  const guestProfile = await models.GuestProfile.findOneAndUpdate(
    {
      profile: profileId,
    },
    {
      ...guestProfileInput,
      profile: profileId,
    },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  // Reset GuestProfileLoader for next load
  guestProfileLoader.clear(activeProfileId)
  guestProfileLoader.clear(profileId)

  // Update profile's availableOnly
  await updateProfileAvailability(guestProfile.profile)
  return guestProfile
}

export async function deleteGuestProfiles(profileId, shouldHardDelete = false) {
  const whereOptions = { profile: profileId }
  if (shouldHardDelete) {
    await models.GuestProfile.deleteMany(whereOptions)
  } else {
    await models.GuestProfile.delete(whereOptions).exec()
  }
}

export async function restoreGuestProfiles(profileId) {
  const whereOptions = { profile: profileId }
  await models.GuestProfile.restore(whereOptions).exec()
}
