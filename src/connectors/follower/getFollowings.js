import models from 'Models'
import { simpleProfileSelector } from 'DataLoaders/simpleProfileLoader'
import { getAllFollowingProfileIds } from './getAllFollowingProfileIds'
import { DEFAULT_FOLLOWINGS_LIMIT } from './utils'

export async function getFollowings(
  profileId,
  activeProfileId,
  offset,
  limit,
  version = 'v1'
) {
  const followingProfileIds = await getAllFollowingProfileIds({
    profileId,
    activeProfileId,
  })
  const query = models.Profile.find({
    _id: { $in: followingProfileIds },
  })
    .sort({ dateActive: -1 })
    .skip(offset || 0)
    .limit(limit || DEFAULT_FOLLOWINGS_LIMIT)

  const profiles = await (() => {
    if (version === 'v2') {
      return query.select(simpleProfileSelector).lean().exec()
    }
    return query.lean().exec()
  })()

  return {
    total: followingProfileIds.length,
    profiles,
  }
}
