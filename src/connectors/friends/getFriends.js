import {
  getFriendProfileCount,
  getFriendProfiles,
  getMutualFriendProfileCount,
  getMutualFriendProfiles,
  getOtherProfileFriendProfiles,
  getPendingFriendProfileCount,
  getPendingFriendProfiles,
} from 'Connectors/friends'

/**
 * Returns the friends by type - all, pending, mutual
 */
export const getFriends = async (input, context, version = 'v1') => {
  const { type, targetProfileId, offset, limit } = input
  const { activeProfileId } = context

  let profiles = []
  let totalCount = 0
  let mutualCount = 0
  const profileId = targetProfileId || activeProfileId

  if (activeProfileId !== profileId) {
    mutualCount = await getMutualFriendProfileCount({
      activeProfileId,
      profileId,
    })
  }

  if (type === 'all') {
    if (activeProfileId === profileId) {
      profiles = await getFriendProfiles({
        profileId: activeProfileId,
        activeProfileId,
        offset,
        limit,
        version,
      })
    } else {
      profiles = await getOtherProfileFriendProfiles({
        otherProfileId: profileId,
        activeProfileId,
        offset,
        limit,
        version,
      })
    }

    totalCount = await getFriendProfileCount({
      profileId,
      activeProfileId,
    })
  } else if (type === 'mutual') {
    if (activeProfileId === profileId) {
      profiles = []
      totalCount = []
    } else {
      profiles = await getMutualFriendProfiles({
        profileId,
        activeProfileId,
        offset,
        limit,
        version,
      })
      totalCount = mutualCount
    }
  } else if (type === 'pending') {
    profiles = await getPendingFriendProfiles({
      profileId,
      activeProfileId,
      offset,
      limit,
      version,
    })
    totalCount = await getPendingFriendProfileCount({
      profileId,
      activeProfileId,
    })
  }

  return {
    profiles,
    totalCount,
    mutualCount,
  }
}
