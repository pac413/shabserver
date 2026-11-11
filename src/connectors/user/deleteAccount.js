import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { deleteSubDataForProfile } from './helpers/deleteSubDataForProfile'

export const deleteAccount = async (profileId) => {
  const profile = await models.Profile.findOneAndUpdate(
    { _id: profileId },
    { accountStatus: ProfileStatuses.DELETED },
    { returnOriginal: false }
  )

  // Soft-delete all sub-data for the profile
  await deleteSubDataForProfile(profileId, false)

  // Hard-delete refreshToken
  await models.RefreshToken.deleteMany({ user: profile.user })

  return {
    success: profile?.accountStatus === ProfileStatuses.DELETED,
  }
}
