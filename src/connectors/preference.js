import models from 'Models'
import { PreferenceType } from 'Models/profile/preference'

export async function setPreference(activeProfileId, input) {
  const { type, preference } = input
  const activeProfile = await models.Profile.findById(activeProfileId)

  if (type === PreferenceType.search) {
    activeProfile.searchPreference = preference
  } else {
    activeProfile.datingPreference = preference
  }
  await activeProfile.save()

  return activeProfile
}
