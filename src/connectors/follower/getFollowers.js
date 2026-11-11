import models from 'Models'
import { simpleProfileSelector } from 'DataLoaders/simpleProfileLoader'
import { getAllFollowerProfileIds } from './getAllFollowerProfileIds'
import { DEFAULT_FOLLOWERS_LIMIT } from './utils'

export async function getFollowers(
  profileId,
  activeProfileId,
  offset,
  limit,
  version = 'v1'
) {
  const followerProfileIds = await getAllFollowerProfileIds({
    profileId,
    activeProfileId,
  })
  const query = models.Profile.find({
    _id: { $in: followerProfileIds },
  })
    .sort({ dateActive: -1 })
    .skip(offset || 0)
    .limit(limit || DEFAULT_FOLLOWERS_LIMIT)

  const profiles = await (() => {
    if (version === 'v2') {
      return query.select(simpleProfileSelector).lean().exec()
    }
    return query.lean().exec()
  })()

  return {
    total: followerProfileIds.length,
    profiles,
  }
}
