import {
  getIsHiddenOrFlagged,
  getIsHiddenOrFlaggedComment,
} from 'Connectors/post'
import models from 'Models'

export default async function deleteFlaggedContents(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = {
    $or: [{ reportedBy: profileId }, { ownedBy: profileId }],
  }
  if (shouldHardDelete) {
    await models.FlaggedContent.deleteMany(whereOptions)
  } else {
    await models.FlaggedContent.delete(whereOptions).exec()
  }

  const postCursor = models.Post.find({
    'flagged.reportedBy': profileId,
  }).cursor()

  for await (const post of postCursor) {
    const idx = post.flagged.findIndex(
      ({ reportedBy }) => reportedBy === profileId
    )
    if (idx < 0) continue
    post.flagged.splice(idx, 1)
    post.isHiddenOrFlagged = getIsHiddenOrFlagged(post)
    await post.save()
  }

  const postCommentCursor = models.PostComment.find({
    'flagged.reportedBy': profileId,
  }).cursor()

  for await (const postComment of postCommentCursor) {
    const idx = postComment.flagged.findIndex(
      ({ reportedBy }) => reportedBy === profileId
    )
    if (idx < 0) continue
    postComment.flagged.splice(idx, 1)
    postComment.isHiddenOrFlagged = getIsHiddenOrFlaggedComment(postComment)
    await postComment.save()
  }
}
