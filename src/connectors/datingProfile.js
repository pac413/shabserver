import { createNewNotification } from 'Connectors/notification'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import models from 'Models'
import {
  NotificationType,
  NotificationStatus,
  NotificationActionStyle,
  NotificationActionType,
} from 'Models/notification/enums'
import { RequestStatus, RequestType } from 'Models/request/enums'
import {
  requestPrivateDatingProfile,
  requestEmailDatingProfile,
  requestDownloadDatingProfile,
  acceptPrivateDatingProfileRequest,
} from 'Services/email'
import {
  prepareRequestEmailTemplate,
  prepareDataForDownloadableDatingProfileTemplate,
} from 'Utils/email'
import { FRONTEND_URL } from 'Utils/globals'
import { getProfileUrl } from 'Utils/profile'
import { UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from '../errors'

export const getDatingProfile = async (profile) => {
  const { siteRoles } = profile
  if (!siteRoles.includes('dating')) {
    return null
  }
  const datingProfile = await models.DatingProfile.find({
    profile: profile._id,
  })
  return datingProfile[0]
}

export const requestDatingProfile = async (input, { activeProfileId }) => {
  const { profileId } = input

  // check if the same request is already existing
  const existingRequest = await models.Request.findOne({
    requestor: activeProfileId,
    recipient: profileId,
    type: RequestType.PrivateDatingProfile,
    status: RequestStatus.Pending,
  })
  if (existingRequest) {
    throw new UserInputError(ERRORS_BY_CODE.DATING_REQUEST_ALREADY_EXISTS)
  }

  // create a new request document
  const payload = await prepareRequestEmailTemplate(profileId, activeProfileId)
  const requestDocument = await models.Request.create({
    requestor: activeProfileId,
    recipient: profileId,
    type: RequestType.PrivateDatingProfile,
    status: RequestStatus.Pending,
  })
  await requestPrivateDatingProfile({
    ...payload,
    confirmActionRedirectUrl: `${FRONTEND_URL}/action/private-dating-profile-request/accept/${requestDocument.id}`,
  })

  await createDatingProfileRequestNotification(requestDocument)

  return {
    success: true,
  }
}

export const emailDatingProfile = async (input, { activeProfileId }) => {
  try {
    const { profileId } = input
    const payload = await prepareDataForDownloadableDatingProfileTemplate(
      profileId,
      activeProfileId
    )
    await requestEmailDatingProfile(payload)

    return {
      success: true,
    }
  } catch (error) {
    return {
      success: false,
      errors: [error],
    }
  }
}

export const downloadDatingProfile = async (input, { activeProfileId }) => {
  try {
    const { profileId } = input
    const payload = await prepareDataForDownloadableDatingProfileTemplate(
      profileId,
      activeProfileId
    )
    const data = await requestDownloadDatingProfile(payload)

    return {
      success: true,
      data,
    }
  } catch (error) {
    return {
      success: false,
      errors: [error],
    }
  }
}

export const acceptDatingProfileRequest = async (
  input,
  { activeProfileId }
) => {
  const { requestId } = input

  // check if the same request is already existing
  const existingRequest = await models.Request.findOne({
    _id: requestId,
    recipient: activeProfileId,
    type: RequestType.PrivateDatingProfile,
    status: RequestStatus.Pending,
  })
  if (!existingRequest) {
    return {
      success: false,
      errors: [new Error('NoRequestExists')],
    }
  }

  // api call to microservice endpoint: accept-dating-profile-private-request-email
  const payload = await prepareDataForDownloadableDatingProfileTemplate(
    existingRequest.recipient,
    existingRequest.requestor
  )
  await acceptPrivateDatingProfileRequest(payload)

  // update the request status as accepted
  existingRequest.status = RequestStatus.Accepted
  await existingRequest.save()

  return {
    success: true,
  }
}

const createDatingProfileRequestNotification = async (requestDocument) => {
  const requestorProfile = await simpleProfileLoader.load(
    requestDocument.requestor
  )

  await createNewNotification({
    profile: requestDocument.recipient,
    triggeredBy: requestDocument.requestor,
    type: NotificationType.DATING_PROFILE_REQUEST,
    title: { name: 'notification.dating-profile-request.title' },
    content: {
      name: 'notification.dating-profile-request.content',
      variables: {
        profileUrl: getProfileUrl(requestorProfile),
        firstName: requestorProfile.firstName,
        lastName: requestorProfile.lastName,
      },
    },
    status: NotificationStatus.NEW,
    referenceId: requestorProfile._id,
    actions: [
      {
        name: 'Accept',
        label: { name: 'notification.dating-profile-request.accept' },
        style: NotificationActionStyle.PRIMARY,
        type: NotificationActionType.ACCEPT_DATING_REQUEST,
        payload: {
          requestId: requestDocument.id,
          profileId: requestorProfile._id,
        },
        actionUrl: `/action/private-dating-profile-request/accept/${requestDocument.id}`,
      },
    ],
  })
}

export async function deleteDatingProfiles(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = { profile: profileId }
  if (shouldHardDelete) {
    await models.DatingProfile.deleteMany(whereOptions)
  } else {
    await models.DatingProfile.delete(whereOptions).exec()
  }
}

export async function restoreDatingProfiles(profileId) {
  const whereOptions = { profile: profileId }
  await models.DatingProfile.restore(whereOptions).exec()
}
