import models from 'Models'

/**
 * Get paginated feed items for all the posts by profileId --- This is for admin only
 * @param {*} input InputPayload - { profileId, limit, offset }
 * @param {*} context Context - { activeProfileId }
 */
export async function getPostsByProfile(input, context) {
  const { activeProfileId } = context
  const { limit, offset } = input
  const profileId = input.profileId || activeProfileId
  let queryBody = {}

  if (profileId === activeProfileId) {
    queryBody = { postedBy: profileId }
  } else {
    queryBody = {
      postedBy: profileId,
      isHiddenOrFlagged: false,
    }
  }

  const total = await models.Post.countDocuments(queryBody)
  if (total === 0) {
    return { total, posts: [] }
  }

  const posts = await models.Post.find(queryBody)
    .sort({ createdAt: -1 })
    .hint('profileFeedIndex')
    .skip(offset)
    .limit(limit)
    .lean()

  return { total, posts }
}
