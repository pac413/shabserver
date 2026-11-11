import models from 'Models'

/**
 * Get paginated feed items for all the posts --- This is for admin only
 * @param {*} input InputPayload - { limit, offset }
 * @param {*} context Context - { activeProfileId }
 */
export async function getAdminGeneralFeed(input, context) {
  const { limit, offset } = input

  const queryBody = {
    eligibleForGeneralFeed: true,
    isHiddenOrFlagged: false,
  }

  const total = await models.Post.countDocuments(queryBody)
  if (total === 0) {
    return { total, posts: [] }
  }

  const posts = await models.Post.find(queryBody)
    .sort({ lastActivityAt: -1 })
    .hint('trendingGeneralFeedIndex')
    .skip(offset)
    .limit(limit)
    .lean()

  return { total, posts }
}
