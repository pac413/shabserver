import { removeFollower } from './removeFollower'

export async function unfollowProfile({ profileId }, context) {
  const { activeProfileId } = context
  await removeFollower(profileId, activeProfileId)
  return true
}
