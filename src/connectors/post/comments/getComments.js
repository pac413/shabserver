import { getActionBlockingProfileIds } from 'Connectors/blocking'
import models from 'Models'

export async function getComments(
  { postId, commentId },
  args,
  { activeProfileId }
) {
  const { limit, offset } = args
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)
  const comments = await models.PostComment.find({
    postId,
    commentId: commentId || null,
    commentedBy: { $nin: profileIdsToBlock },
    $or: [{ isHiddenOrFlagged: false }, { commentedBy: activeProfileId }],
  })
    .limit(limit)
    .skip(offset)
    .lean()

  return comments
}

export async function getCommentsCount(
  { postId, commentId },
  args,
  { activeProfileId }
) {
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)
  const total = await models.PostComment.countDocuments({
    postId,
    commentId: commentId || null,
    commentedBy: { $nin: profileIdsToBlock },
    $or: [{ isHiddenOrFlagged: false }, { commentedBy: activeProfileId }],
  })

  return total
}
