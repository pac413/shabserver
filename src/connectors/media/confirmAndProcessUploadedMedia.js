import { UserInputError } from 'apollo-server-errors'
import mime from 'mime'
import { updateProfile } from 'Connectors/profile'
import { deleteMedia } from 'Connectors/media'
import { ERRORS_BY_CODE } from 'Errors'
import { eventManager } from 'Events'
import models from 'Models'
import { MediaStatus, MediaSubType, MediaType } from 'Models/media/enums'
import { AWS } from 'Services'
import {
  checkIfMediaIsPublic,
  generateMediaPublicUrl,
  sendMediaProcessSQSMessage,
} from 'Utils/media'

/**
 * Update owner for the input media
 * @param {*} media
 */
export const updateMediaOwner = async (media) => {
  // update profile if this media is avatar or wallpaper
  const updateProfileInput = (() => {
    if (media.mediaType === MediaType.PICTURE) {
      if (media.mediaSubType === MediaSubType.AVATAR) {
        return { avatar: media._id }
      } else if (media.mediaSubType === MediaSubType.WALLPAPER) {
        return { wallpaper: media._id }
      }
    }
    return null
  })()
  if (updateProfileInput) {
    await updateProfile(updateProfileInput, { profileId: media.ownerId })
  }
}

const convertPreviousAvatarIntoOriginal = async (media) => {
  // fetch previous avatar
  const prevAvatar = await models.Media.findOne(
    {
      ownerId: media.ownerId,
      mediaSubType: MediaSubType.AVATAR,
    },
    {},
    { sort: { createdAt: -1 } }
  ).lean()

  if (prevAvatar) {
    // before converting the avatar into a profile picture
    // check that the avatar is not already in the library (it could happen when avatar was chosen from library)
    if (prevAvatar.reference && prevAvatar.reference.originalMediaId) {
      const picture = await models.Media.findOne({
        _id: prevAvatar.reference.originalMediaId,
        mediaSubType: MediaSubType.PROFILE,
      }).lean()
      if (picture) {
        return
      }
    }

    // otherwise, convert previous avatar to original
    await models.Media.updateOne(
      { _id: prevAvatar._id },
      {
        $set: { mediaSubType: MediaSubType.ORIGINAL },
      }
    )
  }
}

export default async function confirmAndProcessUploadedMedia(
  input,
  { activeProfileId }
) {
  const {
    id,
    filename,
    mediaType,
    mediaSubType,
    reference,
    profileId = activeProfileId,
    mimetype,
  } = input

  const bucket = AWS.awsS3Bucket
  const fileExt = mime.getExtension(mimetype)
  const s3Key = AWS.generateMediaS3Key({
    mediaType,
    mediaSubType,
    ownerId: profileId,
    id,
    fileExt,
  })
  const isPublic = checkIfMediaIsPublic(mediaType, mediaSubType)

  const postRelatedMediaSubTypes = [
    MediaSubType.POST,
    MediaSubType.COMMENT,
    MediaSubType.COMMENT_REPLY,
  ]
  if (postRelatedMediaSubTypes.includes(mediaSubType)) {
    if (!reference.feedItemId) {
      throw new UserInputError(ERRORS_BY_CODE.INVALID_MEDIA_FEED_REFERENCE)
    }
    reference.postId = reference.feedItemId
    delete reference.feedItemId // delete feedItemId as server always uses postId in the media reference
  }

  // delete the original media for postif exists
  // For now, comment and comment reply attachment is not editable. Therefore we don't check the following cases.
  const junkMedia = await (async () => {
    switch (mediaSubType) {
      case MediaSubType.POST:
        return await models.Media.findOne({
          'reference.postId': reference.postId,
        })
      case MediaSubType.COMMENT:
        return await models.Media.findOne({
          'reference.postId': reference.postId,
          'reference.commentId': reference.commentId,
        })
      case MediaSubType.COMMENT_REPLY:
        return await models.Media.findOne({
          'reference.postId': reference.postId,
          'reference.commentId': reference.commentId,
          'reference.commentReplyId': reference.commentReplyId,
        })
      default:
        return null
    }
  })()
  if (junkMedia) {
    await deleteMedia({ id: junkMedia._id, keepOriginal: false })
  }

  // create a new media document
  const mediaParams = {
    _id: id,
    mediaType,
    mediaSubType,
    ownerId: profileId,
    mimetype,
    originalFilename: filename,
    s3Key,
    originalUrl: isPublic
      ? AWS.getCfPublicUrl(s3Key)
      : generateMediaPublicUrl(id),
    reference: reference || {},
  }

  // if avatar has changed, convert the previous avatar to original
  if (mediaSubType === MediaSubType.AVATAR) {
    await convertPreviousAvatarIntoOriginal(mediaParams)
  }

  const media = await models.Media.create({
    status: MediaStatus.UPLOADED,
    thumbnails: [],
    ...mediaParams,
  })

  // check if media owner should be updated
  if ([MediaSubType.AVATAR, MediaSubType.WALLPAPER].includes(mediaSubType)) {
    updateMediaOwner(media)
  }

  // emit MEDIA_UPLOADED event
  eventManager.emit(eventManager.events.MEDIA_UPLOADED, {
    media,
    event: eventManager.events.MEDIA_UPLOADED,
  })

  // send a new message to sqs queue to process this media
  await sendMediaProcessSQSMessage({
    ...mediaParams,
    bucket,
    fileExt,
  })
  return media
}
