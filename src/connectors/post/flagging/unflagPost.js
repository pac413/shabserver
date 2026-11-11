import { UserInputError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { getIsHiddenOrFlagged } from '../post'

export async function unflagPost(flaggedContent) {
  const { reportedBy, resourceId: postId } = flaggedContent
  const post = await models.Post.findById(postId)

  if (!post) {
    throw new UserInputError(ERRORS_BY_CODE.FLAGGING_INVALID_POST_ID, {
      resourceId: postId,
    })
  }

  const idx = post.flagged.findIndex((fg) => fg.reportedBy === reportedBy)
  if (idx < 0) {
    return
  }

  post.flagged.splice(idx, 1)
  post.isHiddenOrFlagged = getIsHiddenOrFlagged(post)

  await post.save({ timestamps: false })
}
