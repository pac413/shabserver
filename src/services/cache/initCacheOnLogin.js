import blockedCache from 'Connectors/blocking/cache/blockedCache'
import blockingCache from 'Connectors/blocking/cache/blockingCache'
import followerCache from 'Connectors/follower/cache/followerCache'
import followingCache from 'Connectors/follower/cache/followingCache'
import friendCache from 'Connectors/friends/cache/friendCache'
import friendRequestCache from 'Connectors/friends/cache/friendRequestCache'
import connectionsMutedByMe from 'Connectors/mutedConnection/cache/connectionsMutedByMe'
import connectionsThatMutedMe from 'Connectors/mutedConnection/cache/connectionsThatMutedMe'

export async function initCacheOnLogin(activeProfileId) {
  await Promise.all([
    blockingCache.cacheAll(activeProfileId),
    blockedCache.cacheAll(activeProfileId),
    friendCache.cacheAll(activeProfileId),
    friendRequestCache.cacheAll(activeProfileId),
    followerCache.cacheAll(activeProfileId),
    followingCache.cacheAll(activeProfileId),
    connectionsMutedByMe.cacheAll(activeProfileId),
    connectionsThatMutedMe.cacheAll(activeProfileId),
  ])
}
