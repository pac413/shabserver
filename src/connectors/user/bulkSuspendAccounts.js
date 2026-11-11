import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { deleteSubDataForProfile } from './helpers/deleteSubDataForProfile'

export const bulkSuspendAccounts = async (profileIds) => {
  await models.Profile.updateMany(
    { _id: { $in: profileIds } },
    { accountStatus: ProfileStatuses.ADMIN_SUSPENDED }
  )
  const profiles = await models.Profile.findAll({ _id: { $in: profileIds } })

  // Hard-delete all sub-data for the profile
  await Promise.all(
    profileIds.map((profileId) => deleteSubDataForProfile(profileId, true))
  )

  // Hard-delete refreshToken
  const profileUsers = profiles.map((profile) => profile.user)
  await models.RefreshToken.deleteMany({ user: { $in: profileUsers } })

  return {
    success: true,
  }
}
