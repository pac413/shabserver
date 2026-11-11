import { connectionsThatMutedMe } from './cache'

export default async function getConnectionsThatMutedMe(profileId) {
  const cached = await connectionsThatMutedMe.hasCached(profileId)
  if (cached) {
    const mutedProfileIds = await connectionsThatMutedMe.getAll(profileId)
    return mutedProfileIds
  }

  return connectionsThatMutedMe.cacheAll(profileId)
}
