import models from 'Models'
import { SiteRoles } from 'Models/profile/enums'
import { NotificationType } from 'Models/notification/enums'
import updateProfileAvailability from './updateProfileAvailability'

export default async function deleteSiteRole(siteRole, profileId) {
  if (!Object.values(SiteRoles).includes(siteRole)) {
    throw new Error(`Invalid SiteRole ${siteRole}`)
  }
  let model
  if (siteRole === SiteRoles.GUEST) {
    model = models.GuestProfile
  } else if (siteRole === SiteRoles.HOST) {
    model = models.HostProfile
  } else if (siteRole === SiteRoles.DATING) {
    model = models.DatingProfile
  }

  // soft delete {siteRole}Profile
  await model.delete({
    profile: profileId,
  })

  if (siteRole === SiteRoles.DATING) {
    await models.Notification.deleteMany({
      type: NotificationType.DATING_PROFILE_REQUEST,
      profile: profileId,
    })
  }

  // update siteRole for profile
  const profile = await models.Profile.findById(profileId)
  profile.siteRoles = profile.siteRoles.filter((sr) => sr !== siteRole)
  await profile.save()

  // Update Profile's availableOnly
  await updateProfileAvailability(profileId)

  return profile
}
