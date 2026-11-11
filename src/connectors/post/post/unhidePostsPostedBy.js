import models from 'Models'
import { getIsHiddenOrFlagged } from './getIsHiddenOrFlagged'

export async function unhidePostsPostedBy(profileId) {
  await models.Post.updateMany({ postedBy: profileId }, { hidden: false })

  const postCursor = models.Post.find({ postedBy: profileId }).cursor()

  for await (const post of postCursor) {
    post.isHiddenOrFlagged = getIsHiddenOrFlagged(post)
    await post.save()
  }
}
