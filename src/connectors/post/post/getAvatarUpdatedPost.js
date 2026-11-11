import { checkAccessToPost } from 'Connectors/post'
import models from 'Models'
import { PostType } from 'Models/post/enums'

/**
 * Get feed by id
 * @param {*} input InputPayload - { profileId }
 * @param {*} context Context - { activeProfileId }
 */
export async function getAvatarUpdatedPost(input, context) {
  const { activeProfileId } = context
  const profileId = input.profileId || activeProfileId

  const posts = await models.Post.find({
    postedBy: profileId,
    type: PostType.AVATAR_UPDATED,
  })
    .sort({ createdAt: -1 })
    .limit(1)
    .lean()

  if (posts.length === 0) {
    return null
  }
  const post = posts[0]

  const hasAccess = await checkAccessToPost(post, context)
  if (!hasAccess) {
    return null
  }
  return post
}
