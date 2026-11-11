import { intersection } from 'lodash'
import { getFriendProfileIds } from './getFriendProfileIds'

export const getMutualFriendProfileIds = async ({
  profileId,
  activeProfileId,
}) => {
  if (profileId === activeProfileId) {
    return getFriendProfileIds({ profileId, activeProfileId })
  }
  const [profileIds1, profileIds2] = await Promise.all([
    getFriendProfileIds({ profileId, activeProfileId }),
    getFriendProfileIds({ profileId: activeProfileId, activeProfileId }),
  ])

  return intersection(profileIds1, profileIds2)
}
