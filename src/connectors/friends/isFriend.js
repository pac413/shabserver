import friendCache from './cache/friendCache'

export async function isFriend(profileId, activeProfileId) {
  if (profileId === activeProfileId) {
    return true
  }

  return await friendCache.isOneExisting(activeProfileId, profileId)
}
