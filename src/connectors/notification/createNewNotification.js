import i18n from 'i18n'
import moment from 'moment'
import * as OneSignal from 'onesignal-node'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import { getProfileSettings } from 'Connectors/profileSettings'
import { eventManager } from 'Events'
import models from 'Models'
import { NotificationType } from 'Models/notification/enums'
import { ONESIGNAL_API_KEY, ONESIGNAL_APP_ID } from 'Utils/globals'
import { decode } from 'html-entities'

export async function sendPushNotification({
  data,
  notification,
  payload,
  profile,
}) {
  const translatedTitle = i18n.__(
    {
      locale: profile.primaryLocale,
      phrase:
        notification.type === NotificationType.NEW_MESSAGE
          ? data.title.name.replace('title', 'mobile-title')
          : data.title.name,
    },
    data.title.variables || {}
  )

  const translatedContent = i18n.__(
    {
      locale: profile.primaryLocale,
      phrase: data.content.name.replace('content', 'mobile-content'),
    },
    data.content.variables || {}
  )

  const client = new OneSignal.Client(ONESIGNAL_APP_ID, ONESIGNAL_API_KEY)

  const pn = {
    headings: {
      en: decode(translatedTitle),
    },
    contents: {
      en: decode(translatedContent),
    },
    include_player_ids: [profile.onesignalId],
    data: {
      type: notification.type,
      triggeredBy: notification.triggeredBy,
      conversationId: data.conversationId,
      messageId: data.messageId,
      hosting: payload,
    },
    ios_badgeType: 'Increase',
    ios_badgeCount: 1,
  }

  try {
    await client.createNotification(pn)
  } catch (e) {
    if (e instanceof OneSignal.HTTPError) {
      // When status code of HTTP response is not 2xx, HTTPError is thrown.
      console.log(e.statusCode)
      console.log(e.body)
    }
  }
}

export async function createNewNotification(data, payload = {}) {
  const profileIdsToBlock = await getActionBlockingProfileIds(data.profile)
  if (profileIdsToBlock.includes(data.triggeredBy)) {
    return null
  }
  const notification = await models.Notification.create({
    ...data,
    updatedAt: moment.utc().toDate(),
  })

  if (!process.env.IMPORT) {
    const profile = await models.Profile.findById(data.profile)
    const settings = await getProfileSettings(data.profile)

    if (profile.onesignalId) {
      if (
        (notification.type === NotificationType.PROFILE_VIEW &&
          !settings.profileViewsByPush) ||
        ((notification.type === NotificationType.INVITE_REQUEST ||
          notification.type === NotificationType.INVITE_REQUEST_APPROVED ||
          notification.type === NotificationType.INVITE_REQUEST_REJECTED ||
          notification.type === NotificationType.HOSTING_REQUEST ||
          notification.type === NotificationType.HOSTING_REQUEST_APPROVED ||
          notification.type === NotificationType.HOSTING_REQUEST_REJECTED) &&
          !settings.invitesByPush) ||
        ((notification.type === NotificationType.FRIEND_REQUEST ||
          notification.type === NotificationType.FRIEND_REQUEST_APPROVED ||
          notification.type === NotificationType.FRIEND_REQUEST_REJECTED) &&
          !settings.newFriendsByPush) ||
        ((notification.type === NotificationType.POST_COMMENTED ||
          notification.type === NotificationType.POST_COMMENT_COMMENTED) &&
          !settings.commentsByPush) ||
        ((notification.type === NotificationType.POST_LIKED ||
          notification.type === NotificationType.POST_COMMENT_LIKED) &&
          !settings.likesByPush)
      ) {
        return
      }
      await sendPushNotification({ data, notification, payload, profile })
    }
  }

  eventManager.emit(eventManager.events.NEW_NOTIFICATION, notification)
  return notification
}
