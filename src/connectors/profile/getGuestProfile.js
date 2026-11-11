import guestProfileLoader from 'DataLoaders/guestProfileLoader'
import { SiteRoles } from 'Models/profile/enums'

export default async function getGuestProfile(profile) {
  const { siteRoles } = profile
  const id = profile._id || profile.id
  if (!siteRoles.includes(SiteRoles.GUEST)) {
    return null
  }
  const guestProfile = await guestProfileLoader.load(id)
  return guestProfile
}
