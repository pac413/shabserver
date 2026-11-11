import { getActionBlockingProfileIds } from 'Connectors/blocking'
import models from 'Models'

export async function getLikes(
  { postId, commentId },
  args,
  { activeProfileId }
) {
  const { limit, offset } = args
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)
  const comments = await models.PostLike.find({
    postId,
    commentId: commentId || null,
    likedBy: { $nin: profileIdsToBlock },
  })
    .limit(limit)
    .skip(offset)
    .lean()

  return comments
}

export async function getLikesCount(
  { postId, commentId },
  args,
  { activeProfileId }
) {
  const profileIdsToBlock = await getActionBlockingProfileIds(activeProfileId)
  const total = await models.PostLike.countDocuments({
    postId,
    commentId: commentId || null,
    likedBy: { $nin: profileIdsToBlock },
  })

  return total
}
