import isBlocked from './isBlocked'
import isBlocking from './isBlocking'

export default async function isActionBlocked(activeProfileId, profileId) {
  if (activeProfileId === profileId) {
    return false
  }

  const [blocked, blocking] = await Promise.all([
    isBlocked(activeProfileId, profileId),
    isBlocking(activeProfileId, profileId),
  ])
  return blocked || blocking
}
