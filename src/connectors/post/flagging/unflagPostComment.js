import { resolveCommentResourceId } from 'Connectors/flaggedContent/helpers'
import { getIsHiddenOrFlaggedComment } from 'Connectors/post/post/getIsHiddenOrFlagged'
import models from 'Models'

export async function unflagPostComment(flaggedContent) {
  const { reportedBy, resourceId } = flaggedContent
  const { postId, commentId, id } = resolveCommentResourceId(resourceId)

  const comment = await models.PostComment.findOne({
    _id: id || commentId,
    commentId: commentId || null,
    postId,
  })
  const existingIdx = comment.flagged.findIndex(
    (fg) => fg.reportedBy === reportedBy
  )
  if (existingIdx < 0) return

  comment.flagged.splice(existingIdx, 1)
  comment.isHiddenOrFlagged = getIsHiddenOrFlaggedComment(comment)

  await comment.save({ timestamps: false })
}
