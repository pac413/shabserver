import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { deleteSubDataForProfile } from './helpers/deleteSubDataForProfile'

export const suspendAccount = async (profileId) => {
  const profile = await models.Profile.findOneAndUpdate(
    { _id: profileId },
    { accountStatus: ProfileStatuses.ADMIN_SUSPENDED },
    { returnOriginal: false }
  )

  // Hard-delete all sub-data for the profile
  deleteSubDataForProfile(profileId, true)

  // Hard-delete refreshToken
  await models.RefreshToken.deleteMany({ user: profile.user })

  return {
    success: profile?.accountStatus === ProfileStatuses.ADMIN_SUSPENDED,
  }
}
