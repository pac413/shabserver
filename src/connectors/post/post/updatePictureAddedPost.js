import models from 'Models'
import { createMediaForPictureAddedPost } from 'Connectors/media'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { PostType } from 'Models/post/enums'

export async function updatePictureAddedPost(profile, media) {
  console.info(
    `Updating PICTURE_ADDED post for ${profile._id} for ${media._id} Picture`
  )

  // Find the PICTURE_ADDED post for the media
  const { originalMediaId } = media.reference
  const medias = await models.Media.find({
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.POST,
    'reference.originalMediaId': originalMediaId,
  })
  const post = await (async () => {
    for (const mediaItem of medias) {
      const { postId } = mediaItem.reference
      const post = await models.Post.findOne({
        _id: postId,
      })
      if (post && post.type === PostType.PICTURE_ADDED) {
        return post
      }
    }
    return null
  })()
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
    const postMedia = await createMediaForPictureAddedPost({
      postId: post._id,
      media,
    })
    if (!postMedia) {
      console.error(
        'Cannot create media for PICTURE_ADDED Post',
        profile._id,
        media._id
      )
      throw new Error('Failed to create media for PICTURE_ADDED Post')
    }
  } catch (error) {
    // Soft-delete all the related media for this post
    await models.Media.delete({ 'reference.postId': post._id }).exec()
    // Restore the oldMedia only (to keep only media available for this post)
    await models.Media.restore({ _id: oldMedia._id }).exec()
    return
  }

  console.info(`Updated PICTURE_ADDED post for ${profile._id}`, post._id)
  return post
}
