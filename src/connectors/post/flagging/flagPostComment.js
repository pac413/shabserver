import { resolveCommentResourceId } from 'Connectors/flaggedContent/helpers'
import models from 'Models'

export async function flagPostComment(flaggedContent) {
  const { reason, reportedBy, resourceId } = flaggedContent
  const { postId, commentId, id } = resolveCommentResourceId(resourceId)

  const comment = await models.PostComment.findOne({
    _id: id || commentId,
    commentId: commentId || null,
    postId,
  })
  const existing = comment.flagged.find((fg) => fg.reportedBy === reportedBy)
  if (existing) return

  comment.flagged.push({
    reason,
    reportedBy,
  })
  comment.isHiddenOrFlagged = true

  await comment.save({ timestamps: false })
}
