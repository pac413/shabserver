import { getMutualFriendProfileIds } from './getMutualFriendProfileIds'

export const getMutualFriendProfileCount = async ({
  profileId,
  activeProfileId,
}) => {
  const friendProfileIds = await getMutualFriendProfileIds({
    profileId,
    activeProfileId,
  })
  return friendProfileIds.length
}
