import { ProfileFlags, ProfileFlagScopes } from 'Models/profile/enums'

export default function getFlags(profile) {
  const flags = []
  if (!profile.phone || profile.phone.length < 2) {
    flags.push({
      code: ProfileFlags.MISSING_PHONE_NUMBER,
      scopes: [ProfileFlagScopes.HOSTING],
    })
  }
  if (
    !profile.location ||
    profile.location.address.length < 2 ||
    profile.location.city.length < 2 ||
    (profile.location.state < 2 &&
      ['United States', 'Canada'].includes(profile.location.country))
  ) {
    flags.push({
      code: ProfileFlags.INCOMPLETE_ADDRESS,
      scopes: [ProfileFlagScopes.PROFILE],
    })
  }
  return flags.length ? flags : null
}
