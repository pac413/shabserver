import { createNewNotification } from 'Connectors/notification'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { sendMessageRequest, sendAcceptMessageRequest } from 'Services/email'
import {
  prepareRequestEmailTemplate,
  prepareAcceptRequestEmailTemplate,
} from 'Utils/email'
import { FRONTEND_URL } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'

export const prepareAndSendMessageRequest = async (
  recipientId,
  requesterId,
  conversation
) => {
  const template = {
    ...(await prepareRequestEmailTemplate(recipientId, requesterId)),
    deleteActionRedirectUrl: `${FRONTEND_URL}/action/message-request/delete/${conversation.id}`,
    confirmActionRedirectUrl: `${FRONTEND_URL}/action/message-request/accept/${conversation.id}`,
    blockActionRedirectUrl: '',
  }

  await sendMessageRequest(template)
  await createNewMessageRequestNotification(
    recipientId,
    requesterId,
    conversation
  )
}

const createNewMessageRequestNotification = async (
  recipientId,
  requesterId,
  conversation
) => {
  const requesterProfile = await simpleProfileLoader.load(requesterId)

  await createNewNotification({
    profile: recipientId,
    triggeredBy: requesterId,
    type: NotificationType.MESSAGE_REQUEST,
    title: { name: 'notification.new-message-request.title' },
    content: {
      name: 'notification.new-message-request.content',
      variables: {
        profileUrl: getProfileUrl(requesterProfile),
        firstName: requesterProfile.firstName,
        lastName: requesterProfile.lastName,
      },
    },
    status: NotificationStatus.NEW,
    referenceId: conversation.id,
    conversationId: conversation.id,
    actions: [
      {
        name: 'Accept',
        label: { name: 'notification.new-message-request.accept' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.ACCEPT_MESSAGE_REQUEST,
        payload: {
          requestId: conversation.id,
          profileId: requesterProfile.handle,
        },
        actionUrl: `${FRONTEND_URL}/action/message-request/accept/${conversation.id}`,
      },
      {
        name: 'Delete',
        label: { name: 'notification.new-message-request.delete' },
        style: NotificationActionStyle.SECONDARY,
        type: NotificationActionType.DELETE_MESSAGE_REQUEST,
        payload: {
          requestId: conversation.id,
          profileId: requesterProfile.handle,
        },
        actionUrl: `${FRONTEND_URL}/action/message-request/delete/${conversation.id}`,
      },
    ],
  })
}

export const prepareAndSendAcceptConversationRequest = async (
  triggeredBy,
  recipientId,
  conversation
) => {
  const triggeredByProfile = await simpleProfileLoader.load(triggeredBy)
  const template = {
    ...(await prepareAcceptRequestEmailTemplate(triggeredBy, recipientId)),
    messagingUrl: `${FRONTEND_URL}/messages/${triggeredByProfile.handle}`,
  }

  await sendAcceptMessageRequest(template)
  await createMessageRequestApprovedNotification(
    triggeredBy,
    recipientId,
    conversation
  )
}

const createMessageRequestApprovedNotification = async (
  triggeredBy,
  recipientId,
  conversation
) => {
  const triggeredByProfile = await simpleProfileLoader.load(triggeredBy)

  await createNewNotification({
    profile: recipientId,
    triggeredBy,
    type: NotificationType.MESSAGE_REQUEST_APPROVED,
    title: { name: 'notification.new-message-approved.title' },
    content: {
      name: 'notification.new-message-approved.content',
      variables: {
        profileUrl: getProfileUrl(triggeredByProfile),
        firstName: triggeredByProfile.firstName,
        lastName: triggeredByProfile.lastName,
      },
    },
    status: NotificationStatus.NEW,
    referenceId: conversation.id,
    conversationId: conversation.id,
  })
}
