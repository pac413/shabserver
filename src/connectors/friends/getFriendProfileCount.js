import { getFriendProfileIds } from './getFriendProfileIds'

export const getFriendProfileCount = async ({ profileId, activeProfileId }) => {
  const friendProfileIds = await getFriendProfileIds({
    profileId,
    activeProfileId,
  })
  return friendProfileIds.length
}
