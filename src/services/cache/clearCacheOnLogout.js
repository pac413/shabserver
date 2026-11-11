import { clearBlockingsByProfile } from 'Connectors/blocking/cache'
import followerCache from 'Connectors/follower/cache/followerCache'
import followingCache from 'Connectors/follower/cache/followingCache'
import friendCache from 'Connectors/friends/cache/friendCache'
import friendRequestCache from 'Connectors/friends/cache/friendRequestCache'

export async function clearCacheOnLogout(activeProfileId) {
  console.log('Clearing cache on logout')
  await Promise.all([
    clearBlockingsByProfile(activeProfileId),
    friendCache.clearAll(activeProfileId),
    friendRequestCache.clearAll(activeProfileId),
    followerCache.clearAll(activeProfileId),
    followingCache.clearAll(activeProfileId),
  ])
}
