import { UserInputError } from 'apollo-server-errors'
import { checkAccessToPost } from 'Connectors/post'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { PostType } from 'Models/post/enums'

export async function deletePictureAddedPost({ mediaId }, context) {
  const media = await models.Media.findById(mediaId)
  if (!media) {
    console.error(`Cannot find media for Media: ${mediaId}`)
    return false
  }

  const { originalMediaId } = media.reference || {}
  const postMedia = await models.Media.findOne({
    'reference.originalMediaId': originalMediaId,
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.POST,
  })
  if (!postMedia) {
    console.error(`Cannot find Picture-Post media for Media: ${mediaId}`)
    return false
  }
  const { postId } = postMedia.reference
  if (!postId) {
    console.error(
      `Cannot find postId for Picture-Post media for Media: ${mediaId}`
    )
    return
  }
  const post = await models.Post.findById(postId).lean()
  if (!post) {
    console.error(`No post related with _id: ${postId}`)
    return
  }
  if (![PostType.PICTURE_ADDED, PostType.AVATAR_UPDATED].includes(post.type)) {
    console.error(`Malformed data Post ${postId} is not picture/avatar post`)
    return
  }

  console.info(`Removing post ${postId} as picture ${mediaId} is being removed`)

  const hasAccess = await checkAccessToPost(post, context)
  if (!hasAccess) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }
  await models.Post.deleteOne({ _id: postId })
  eventManager.emit(eventManager.events.POST_DELETED, { post })
  return true
}
