import {
  getAllFollowerProfileIds,
  getAllFollowingProfileIds,
} from 'Connectors/follower'
import { getFriendProfileIds } from 'Connectors/friends'

export default async function getAllConnections({
  profileId,
  activeProfileId,
}) {
  // get all friends, followers, followings
  const [friendIds, followerIds, followingIds] = await Promise.all([
    getFriendProfileIds({ profileId, activeProfileId }),
    getAllFollowerProfileIds({ profileId, activeProfileId }),
    getAllFollowingProfileIds({ profileId, activeProfileId }),
  ])

  return {
    friendIds,
    followerIds,
    followingIds,
  }
}
