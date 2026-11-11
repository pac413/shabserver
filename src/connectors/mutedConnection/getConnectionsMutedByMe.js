import { connectionsMutedByMe } from './cache'

export default async function getConnectionsMutedByMe(profileId) {
  const cached = await connectionsMutedByMe.hasCached(profileId)
  if (cached) {
    const mutedProfileIds = await connectionsMutedByMe.getAll(profileId)
    return mutedProfileIds
  }

  return connectionsMutedByMe.cacheAll(profileId)
}
