import { getPendingFriendProfileIds } from './getPendingFriendProfileIds'

export const getPendingFriendProfileCount = async ({
  profileId,
  activeProfileId,
}) => {
  const friendProfileIds = await getPendingFriendProfileIds({
    profileId,
    activeProfileId,
  })
  return friendProfileIds.length
}
