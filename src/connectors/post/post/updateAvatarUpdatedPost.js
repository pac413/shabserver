import models from 'Models'
import { PostType } from 'Models/post/enums'
import { createMediaForProfileAvatarPost } from 'Connectors/media'

export async function updateAvatarUpdatedPost(profile) {
  if (!profile.avatar) {
    return
  }
  console.info(`Updating AVATAR_UPDATED post for ${profile._id}`)

  // Find the latest AVATAR_UPDATED post
  const post = await models.Post.findOne(
    {
      type: PostType.AVATAR_UPDATED,
      postedBy: profile._id,
    },
    {},
    { sort: { createdAt: -1 } }
  )
  if (!post) {
    return
  }

  // Delete an old media for the post
  const oldMedia = await models.Media.findOne({
    'reference.postId': post._id,
  })
  await models.Media.delete({ _id: oldMedia._id }).exec()

  try {
    // Create a media for the new avatar
    const media = await createMediaForProfileAvatarPost(profile, post._id)
    if (!media) {
      console.error(
        'Cannot create media for AVATAR_UPDATED Post',
        profile._id,
        profile.avatar
      )
      throw new Error('Failed to create media for AVATAR_UPDATED Post')
    }
  } catch (error) {
    // Soft-delete all the related media for this post
    await models.Media.delete({ 'reference.postId': post._id }).exec()
    // Restore the oldMedia only (to keep only media available for this post)
    await models.Media.restore({ _id: oldMedia._id }).exec()
    return
  }

  console.info(`Updated AVATAR_UPDATED post for ${profile._id}`, post._id)
  return post
}
