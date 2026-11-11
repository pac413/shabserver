import models from 'Models'
import { getIsHiddenOrFlaggedComment } from '../post'

export async function unhidePostCommentsPostedBy(profileId) {
  await models.PostComment.updateMany(
    { commentedBy: profileId },
    { hidden: false }
  )

  const postCommentCursor = models.PostComment.find({
    commentedBy: profileId,
  }).cursor()

  for await (const postComment of postCommentCursor) {
    postComment.isHiddenOrFlagged = getIsHiddenOrFlaggedComment(postComment)
    await postComment.save()
  }
}
