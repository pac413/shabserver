import { UserInputError } from 'apollo-server-express'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import flagPost from './flagPost'

export async function flagProfileAvatarPost(flaggedContent) {
  const { reason, reportedBy, resourceId: mediaId } = flaggedContent

  const media = await models.Media.findOne({
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.POST,
    'reference.originalMediaId': mediaId,
  })
  if (!media) {
    throw new UserInputError(
      ERRORS_BY_CODE.FLAGGING_INVALID_PROFILE_AVATAR_ID,
      { resourceId: mediaId }
    )
  }

  media.hidden = true
  await media.save()

  const postId = media.reference.postId
  if (!postId) {
    console.error('Malformed avatar post', { mediaId })
    return
  }

  await flagPost({
    reason,
    reportedBy,
    resourceId: postId,
  })
}
