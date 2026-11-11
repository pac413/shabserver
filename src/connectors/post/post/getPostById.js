import { UserInputError } from 'apollo-server-errors'
import { checkAccessToPost } from 'Connectors/post'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'

/**
 * Get post by id
 * @param {*} input InputPayload - { postId, source }
 * @param {*} context Context - { activeProfileId }
 */
export async function getPostById({ postId, id }, context) {
  const post = await models.Post.findById(postId || id).lean()
  const hasAccess = await checkAccessToPost(post, context)
  if (!hasAccess) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }

  return post
}
