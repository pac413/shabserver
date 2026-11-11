import {
  flagPost,
  flagPostComment,
  flagProfilePicturePost,
  flagProfileAvatarPost,
} from 'Connectors/post'
import models from 'Models'
import { FlaggedContentType } from 'Models/flaggedContent/enums'
import getFlaggedResourceOwner from './getFlaggedResourceOwner'
import { prepareAndSendFlaggedContentEmail } from './email'

export const flagResource = async (flaggedContent) => {
  const { type } = flaggedContent
  if (type === FlaggedContentType.POST) {
    await flagPost(flaggedContent)
  } else if (type === FlaggedContentType.COMMENT) {
    await flagPostComment(flaggedContent)
  } else if (type === FlaggedContentType.COMMENT_REPLY) {
    await flagPostComment(flaggedContent)
  } else if (type === FlaggedContentType.MEDIA_PROFILE_PICTURE) {
    await flagProfilePicturePost(flaggedContent)
  } else if (type === FlaggedContentType.MEDIA_AVATAR) {
    await flagProfileAvatarPost(flaggedContent)
  }
}

export default async function (input, context) {
  const { resourceId, type, reason } = input
  const { activeProfileId } = context

  const existing = await models.FlaggedContent.findOne({
    resourceId,
    type,
    reportedBy: activeProfileId,
  })
  if (existing) {
    return true
  }

  const ownedBy = await getFlaggedResourceOwner({ resourceId, type })
  const flaggedContent = await models.FlaggedContent.create({
    resourceId,
    type,
    reason,
    reportedBy: activeProfileId,
    ownedBy,
  })

  const activeProfile = await models.Profile.findById(activeProfileId)
    .select({ isZealot: 1 })
    .lean()

  if (activeProfile.isZealot) {
    return true
  }

  const obj = flaggedContent.toObject()
  try {
    await flagResource(obj)
    await prepareAndSendFlaggedContentEmail(obj, activeProfileId, ownedBy)
  } catch (err) {
    await flaggedContent.delete()
    throw err
  }

  return true
}
