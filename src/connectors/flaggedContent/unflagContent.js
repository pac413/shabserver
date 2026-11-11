import { ForbiddenError } from 'apollo-server-express'
import {
  unflagPost,
  unflagPostComment,
  unflagProfilePicturePost,
  unflagProfileAvatarPost,
} from 'Connectors/post'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { FlaggedContentType } from 'Models/flaggedContent/enums'
import { Roles } from 'Utils/globals'

export default async function ({ id }, context) {
  const { role } = context
  if (role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
  }

  const flaggedContent = await models.FlaggedContent.findById(id)
  if (!flaggedContent) {
    return { success: true }
  }

  const obj = flaggedContent.toObject()
  if (flaggedContent.type === FlaggedContentType.POST) {
    await unflagPost(obj)
  } else if (flaggedContent.type === FlaggedContentType.COMMENT) {
    await unflagPostComment(obj)
  } else if (flaggedContent.type === FlaggedContentType.COMMENT_REPLY) {
    await unflagPostComment(flaggedContent)
  } else if (flaggedContent.type === FlaggedContentType.MEDIA_PROFILE_PICTURE) {
    await unflagProfilePicturePost(obj)
  } else if (flaggedContent.type === FlaggedContentType.MEDIA_AVATAR) {
    await unflagProfileAvatarPost(obj)
  }

  await flaggedContent.remove()
  return true
}
