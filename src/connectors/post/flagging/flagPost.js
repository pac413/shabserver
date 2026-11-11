import { UserInputError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'

export async function flagPost(flaggedContent) {
  const { reason, reportedBy, resourceId: postId } = flaggedContent
  const post = await models.Post.findById(postId)

  if (!post) {
    throw new UserInputError(ERRORS_BY_CODE.FLAGGING_INVALID_POST_ID, {
      resourceId: postId,
    })
  }

  const existing = post.flagged.find((fg) => fg.reportedBy === reportedBy)
  if (existing) {
    return
  }

  post.flagged.push({
    reason,
    reportedBy,
  })
  post.isHiddenOrFlagged = true

  await post.save({ timestamps: false })
}
