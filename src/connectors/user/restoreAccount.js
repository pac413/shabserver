import { addSiteRole } from 'Connectors/profile'
import models from 'Models'
import { ProfileStatuses, SiteRoles } from 'Models/profile/enums'
import { restoreSubDataForProfile } from './helpers/restoreSubDataForProfile'

export const restoreAccount = async (profileId) => {
  let profile = await models.Profile.findById(profileId)

  // STEP 1: Check if profile is suspended
  const isSuspended = profile.accountStatus === ProfileStatuses.ADMIN_SUSPENDED

  if (isSuspended) {
    // STEP 2.1: For suspended profiles, should reset `siteRoles`
    profile.siteRoles = []
    profile = await profile.save()

    // STEP 2.2: Add guest siteRole only
    addSiteRole(SiteRoles.GUEST, profileId)
  } else {
    // STEP 3: For deleted profiles, should restore subdata
    await restoreSubDataForProfile(profileId)
  }

  // STEP 4: Update profile accountStatus to active
  profile.accountStatus = ProfileStatuses.ACTIVE
  profile = await profile.save()

  return {
    success: profile?.accountStatus === ProfileStatuses.ACTIVE,
  }
}
