import { ForbiddenError, UserInputError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { Roles } from 'Utils/globals'

/**
 * Get comment by id
 * @param {*} input InputPayload - { id, postId }
 * @param {*} context Context - { activeProfileId }
 */
export async function getCommentById(input, context) {
  const { role } = context
  const { id, postId } = input

  if (role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
  }

  const comment = await models.PostComment.findOne({
    _id: id,
    postId,
  })

  if (!comment) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_COMMENT_ID)
  }

  return comment
}
