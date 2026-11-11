import models from 'Models'
import { HostProfileStatus } from 'Models/hostProfile/enums'
import { GuestProfileStatus } from 'Models/guestProfile/enums'

export default async function updateProfileAvailability(profileId) {
  const availableGuestProfileCount = await models.GuestProfile.countDocuments({
    profile: profileId,
    status: GuestProfileStatus.AVAILABLE,
  })
  const availableHostProfileCount = await models.HostProfile.countDocuments({
    profile: profileId,
    status: HostProfileStatus.AVAILABLE,
  })
  await models.Profile.updateOne(
    { _id: profileId },
    {
      availableOnly: {
        guest: !!availableGuestProfileCount,
        host: !!availableHostProfileCount,
      },
    }
  )

  // get updated profile
  const profile = await models.Profile.findById(profileId).lean()
  return profile
}
