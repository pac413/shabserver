import moment from 'moment'
import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { Roles } from 'Utils/globals'
import { isForbiddenByCountry } from 'Utils/riskScore'

/**
 * Called when the user is authenticated through jwt.
 * - Saved the current related profile's last active date
 * - Returns the authenticated user's roles and if it is admin or not
 *
 * @param {User} tokenData user objects loaded from the token
 */
export default async function getTokenInfo(tokenData) {
  if (!tokenData) {
    return null
  }

  const [profile, user] = await Promise.all([
    models.Profile.findById(tokenData.profileId),
    models.User.findById(tokenData.userId),
  ])
  if (!profile || !user) {
    return null
  }

  if (
    profile.accountStatus === ProfileStatuses.ADMIN_SUSPENDED ||
    profile.accountStatus === ProfileStatuses.DELETED
  ) {
    return null
  }

  if (
    profile.riskAssessment &&
    profile.riskAssessment.location &&
    isForbiddenByCountry(profile.riskAssessment.location.country)
  ) {
    return null
  }

  profile.dateActive = moment.utc().toDate()
  await profile.save()
  return {
    login: 'success',
    profileId: profile._id,
    siteRoles: profile.siteRoles,
    isAdmin: tokenData.role === Roles.Admin,
    status: profile.accountStatus,
    primaryLocale: profile.primaryLocale,
    emailConfirmed: !!user.emailConfirmed,
  }
}
