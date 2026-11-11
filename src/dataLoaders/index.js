import { createIsMyHostLoader } from './isMyHostLoader'
import { createIsMyGuestLoader } from './isMyGuestLoader'

export const getProfileDataLoaders = (profileId) => {
  return {
    isMyHost: profileId ? createIsMyHostLoader(profileId) : null,
    isMyGuest: profileId ? createIsMyGuestLoader(profileId) : null,
  }
}
