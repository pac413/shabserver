import moment from 'moment'
import { v4 as uuid } from 'uuid'
import { getProfileSettings } from 'Connectors/profileSettings'
import { isFeedRestricted } from 'Connectors/user'
import models from 'Models'
import { PostStatus, PostType } from 'Models/post/enums'
import { parseContent } from 'Utils/feed'
import { PostPrivacySetting } from 'Models/profileSettings/enums'
import { eventManager } from 'Events'
import { getEligibleForGeneralFeed } from './getEligibleForGeneralFeed'
import { getIsHiddenOrFlagged } from './getIsHiddenOrFlagged'

export async function createPost(postPayload, context) {
  const { activeProfileId } = context
  const [activeProfile, activeProfileSettings] = await Promise.all([
    models.Profile.getRestrictions(activeProfileId),
    getProfileSettings(activeProfileId),
  ])

  if (isFeedRestricted(activeProfile)) {
    postPayload.hidden = true
  }
  const { content, type: inputType, ...others } = postPayload
  const postContent = parseContent(content)
  const privacySetting =
    activeProfileSettings.postPrivacy || PostPrivacySetting.ALL
  const flagged = []
  const type = inputType || PostType.DEFAULT

  const eligibleForGeneralFeed = getEligibleForGeneralFeed(postPayload)
  const isHiddenOrFlagged = getIsHiddenOrFlagged(postPayload)
  const post = await models.Post.create({
    _id: uuid(),
    contentUpdatedAt: moment.utc().toDate(),
    content: postContent,
    postedBy: activeProfileId,
    flagged,
    share: [],
    hasMedia: false,
    status: PostStatus.ACTIVE,
    type,
    privacySetting,
    eligibleForGeneralFeed,
    isHiddenOrFlagged,
    ...others,
  })

  eventManager.emit(eventManager.events.POST_CREATED, { post })

  return post
}
