import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { simpleProfileSelector } from 'DataLoaders/simpleProfileLoader'
import { getFriendProfileIds } from './getFriendProfileIds'
import { DEFAULT_FRIENDS_LIMIT } from './utils'

export const getOtherProfileFriendProfiles = async ({
  activeProfileId,
  otherProfileId,
  offset,
  limit,
  version = 'v1',
}) => {
  //   const [friendProfileIds, mutualProfileIds] = await Promise.all([
  //     getFriendProfileIds({ profileId: otherProfileId, activeProfileId }),
  //     getMutualFriendProfileIds({ profileId: otherProfileId, activeProfileId }),
  //   ])

  //   const mutualFriends = await models.Profile.find({
  //     _id: { $in: mutualProfileIds },
  //     accountStatus: {
  //       $ne: ProfileStatuses.DELETED,
  //     },
  //   })
  //     .sort({ dateActive: -1 })
  //     .skip(offset || 0)
  //     .limit(limit || DEFAULT_FRIENDS_LIMIT)
  //     .select(simpleProfileSelector)
  //     .lean()

  //   const nonMutualProfileIds = difference(friendProfileIds, mutualProfileIds)
  //   const profileFriends = await models.Profile.find({
  //     _id: { $in: nonMutualProfileIds },
  //     accountStatus: {
  //       $ne: ProfileStatuses.DELETED,
  //     },
  //   })
  //     .sort({ dateActive: -1 })
  //     .skip(Math.max(0, offset - mutualFriends.length))
  //     .limit(Math.max(0, limit - mutualFriends.length))
  //     .select(simpleProfileSelector)
  //     .lean()

  //   const profiles = mutualFriends.concat(profileFriends)
  //   return profiles

  const friendProfileIds = await getFriendProfileIds({
    profileId: otherProfileId,
    activeProfileId,
  })

  const query = models.Profile.find({
    _id: { $in: friendProfileIds },
    accountStatus: {
      $ne: ProfileStatuses.DELETED,
    },
  })
    .sort({ dateActive: -1 })
    .skip(offset || 0)
    .limit(limit || DEFAULT_FRIENDS_LIMIT)

  const profiles = await (() => {
    if (version === 'v2') {
      return query.select(simpleProfileSelector).lean().exec()
    }
    return query.lean().exec()
  })()
  return profiles
}
