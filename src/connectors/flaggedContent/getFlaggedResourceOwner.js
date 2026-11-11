import models from 'Models'
import { resolveCommentResourceId } from './helpers'

const getPostOwner = async (resourceId) => {
  const post = await models.Post.findById(resourceId)
    .select({ postedBy: 1 })
    .lean()
  return post ? post.postedBy : null
}

const getCommentOwner = async (resourceId) => {
  const { postId, commentId, id } = resolveCommentResourceId(resourceId)
  const comment = await models.PostComment.findOne({
    _id: id || commentId,
    commentId: commentId || null,
    postId,
  })
  return comment ? comment.commentedBy : null
}

const getMediaProfilePictureOwner = async (resourceId) => {
  const picture = await models.Media.findById(resourceId)
  return picture ? picture.ownerId : null
}

const getMediaProfileAvatarOwner = async (resourceId) => {
  const avatar = await models.Media.findById(resourceId)
  return avatar ? avatar.ownerId : null
}

const getEndorsementOwner = async (resourceId) => {
  const endorsement = await models.Endorsement.findById(resourceId)
  return endorsement ? endorsement.profile : null
}

export default async function ({ resourceId, type }) {
  const {
    COMMENT,
    COMMENT_REPLY,
    ENDORSEMENT,
    MEDIA_AVATAR,
    MEDIA_PROFILE_PICTURE,
    POST,
  } = models.FlaggedContent.FlaggedContentType

  switch (type) {
    case POST:
      return getPostOwner(resourceId)
    case COMMENT:
      return getCommentOwner(resourceId)
    case COMMENT_REPLY:
      return getCommentOwner(resourceId)
    case MEDIA_PROFILE_PICTURE:
      return getMediaProfilePictureOwner(resourceId)
    case MEDIA_AVATAR:
      return getMediaProfileAvatarOwner(resourceId)
    case ENDORSEMENT:
      return getEndorsementOwner(resourceId)
    default:
      return null
  }
}
