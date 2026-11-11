import moment from 'moment'
import { isFeedRestricted } from 'Connectors/user'
import models from 'Models'
import { MediaSubType } from 'Models/media/enums'
import { PostStatus, PostType } from 'Models/post/enums'
import { getProfileSettings } from 'Connectors/profileSettings'
import { getEligibleForGeneralFeed } from './getEligibleForGeneralFeed'
import { getIsHiddenOrFlagged } from './getIsHiddenOrFlagged'

/**
 * Duplicate the post for activeProfile
 *
 * @param {*} post
 * @param {*} targetProfileId
 */
export async function duplicatePost(post, context) {
  const { activeProfileId } = context
  const [activeProfile, activeProfileSettings] = await Promise.all([
    models.Profile.getRestrictions(activeProfileId),
    getProfileSettings(activeProfileId),
  ])
  const { content, webScraped, hasMedia } = post

  // Duplicate post document
  const newPostPayload = {
    contentUpdatedAt: moment.utc().toDate(),
    content,
    webScraped,
    postedBy: activeProfileId,
    flagged: [],
    share: [],
    hasMedia,
    status: PostStatus.ACTIVE,
    type: PostType.DEFAULT,
    privacySetting: activeProfileSettings.postPrivacy,
    hidden: isFeedRestricted(activeProfile),
  }
  newPostPayload.eligibleForGeneralFeed =
    getEligibleForGeneralFeed(newPostPayload)
  newPostPayload.isHiddenOrFlagged = getIsHiddenOrFlagged(newPostPayload)
  const newPost = await models.Post.create(newPostPayload)

  // Duplicate media document if exists
  const media = await models.Media.findOne({
    ownerId: post.postedBy,
    mediaSubType: MediaSubType.POST,
    'reference.postId': post._id,
  })
  if (media) {
    const newMediaPayload = {
      mediaType: media.mediaType,
      mediaSubType: media.mediaSubType,
      ownerId: activeProfileId,
      mimetype: media.mimetype,
      originalFilename: media.originalFilename,
      s3Key: media.s3Key,
      originalUrl: media.originalUrl,
      status: media.status,
      thumbnails: media.thumbnails,
      quality: media.quality,
      trailer: media.trailer,
      meta: media.meta,
      reference: {
        originalMediaId: media._id,
        postId: newPost._id,
      },
    }
    await models.Media.create(newMediaPayload)
  }

  return post
}
