import blockedCache from './blockedCache'
import blockingCache from './blockingCache'

export default async function clearBlockingsByProfile(profileId) {
  console.log(`clearing blockings cache for ${profileId}`)
  await Promise.all([
    blockingCache.clearAll(profileId),
    blockedCache.clearAll(profileId),
  ])
}
