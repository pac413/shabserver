import models from 'Models'
import { simpleProfileSelector } from 'DataLoaders/simpleProfileLoader'
import { getMutualFriendProfileIds } from './getMutualFriendProfileIds'
import { DEFAULT_FRIENDS_LIMIT } from './utils'

export const getMutualFriendProfiles = async ({
  profileId,
  activeProfileId,
  offset,
  limit,
  version = 'v1',
}) => {
  const mutualFriendProfileIds = await getMutualFriendProfileIds({
    profileId,
    activeProfileId,
  })
  const query = models.Profile.find({ _id: mutualFriendProfileIds })
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
