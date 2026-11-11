import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { simpleProfileSelector } from 'DataLoaders/simpleProfileLoader'
import { getFriendProfileIds } from './getFriendProfileIds'
import { DEFAULT_FRIENDS_LIMIT } from './utils'

export const getFriendProfiles = async ({
  profileId,
  activeProfileId,
  offset,
  limit,
  version = 'v1',
}) => {
  const friendProfileIds = await getFriendProfileIds({
    profileId,
    activeProfileId,
  })
  const query = models.Profile.find({
    _id: friendProfileIds,
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
