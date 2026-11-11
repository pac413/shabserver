import { ForbiddenError, UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { Roles } from 'Utils/globals'

export async function hidePostFromFeed({ id }, context) {
  const { role } = context
  if (role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.DELETE_POST_COMMENT_FORBIDDEN)
  }
  const post = await models.Post.findById(id)
  if (!post) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID, {
      postId: id,
    })
  }

  post.excludedFromFeedByAdmin = true
  await post.save()

  return { id }
}

export async function unhidePostFromFeed({ id }, context) {
  const { role } = context
  if (role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.DELETE_POST_COMMENT_FORBIDDEN)
  }
  const post = await models.Post.findById(id)
  if (!post) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID, {
      postId: id,
    })
  }

  post.excludedFromFeedByAdmin = false
  await post.save()

  return { id }
}
