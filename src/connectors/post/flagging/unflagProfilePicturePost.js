import { UserInputError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import unflagPost from './unflagPost'

export async function unflagProfilePicturePost(flaggedContent) {
  const { reportedBy, resourceId: mediaId } = flaggedContent

  const postMedia = await models.Media.findOne({
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.POST,
    'reference.originalMediaId': mediaId,
  })
  const profilePicture = await models.Media.findOne({
    mediaType: MediaType.PICTURE,
    _id: mediaId,
  })

  if (!profilePicture && !postMedia) {
    throw new UserInputError(
      ERRORS_BY_CODE.FLAGGING_INVALID_PROFILE_PICTURE_ID,
      { resourceId: mediaId }
    )
  }

  if (profilePicture) {
    profilePicture.hidden = false
    await profilePicture.save()
  }

  if (postMedia) {
    postMedia.hidden = true
    await postMedia.save()

    const postId = postMedia.reference.postId
    if (!postId) {
      console.error('Malformed picture post', { mediaId })
      return
    }

    await unflagPost({
      reportedBy,
      resourceId: postId,
    })
  }
}
