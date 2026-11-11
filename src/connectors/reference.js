import {
  ApolloError,
  ForbiddenError,
  UserInputError,
} from 'apollo-server-express'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { RequestStatus, RequestType } from 'Models/request/enums'
import { sendRequestReference, sendReferences } from 'Services/email'
import { prepareRequestEmailTemplate } from 'Utils/email'
import { FRONTEND_URL, Roles } from 'Utils/globals'

export const getReferences = async (
  profileId,
  siteRole,
  { offset, limit } = { offset: 0 }
) => {
  let references
  const filters = {
    profile: profileId,
    ...(siteRole ? { siteRole } : {}),
  }

  if (limit) {
    references = await models.Reference.find(filters)
      .sort({ createdAt: -1 })
      .skip(offset || 0)
      .limit(limit)
      .lean()
  } else {
    references = await models.Reference.find(filters)
      .sort({ createdAt: -1 })
      .skip(offset || 0)
      .lean()
  }
  return references
}

export const getPublicReferences = async (
  profileId,
  siteRole,
  { offset, limit } = { offset: 0 }
) => {
  let references
  const filters = {
    profile: profileId,
    ...(siteRole ? { siteRole } : {}),
  }
  if (limit) {
    references = await models.Reference.find(filters)
      .sort({ createdAt: -1 })
      .select({ name: 1, siteRole: 1 })
      .skip(offset || 0)
      .limit(limit)
      .lean()
  } else {
    references = await models.Reference.find(filters)
      .sort({ createdAt: -1 })
      .select({ name: 1, siteRole: 1 })
      .skip(offset || 0)
      .lean()
  }
  return references
}

export const addReference = async (input, { activeProfileId, role }) => {
  const { name, phone, email, relationship, siteRole } = input

  const profileId = input.profileId ? input.profileId : activeProfileId
  if (input.profileId !== activeProfileId && role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.CREATE_REFERENCE_FORBIDDEN, input)
  }

  const reference = await models.Reference.create({
    profile: profileId,
    name,
    email,
    phone,
    relationship,
    siteRole,
    profileShabbatMember: '', // Todo: for now, we are not setting this field
  })
  return { reference }
}

export const updateReference = async (input, { activeProfileId, role }) => {
  const { id, ...attrs } = input
  const reference = await models.Reference.findById(id)
  if (reference.profile !== activeProfileId && role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.UPDATE_REFERENCE_FORBIDDEN, {
      profileId: reference.profile,
    })
  }

  Object.keys(attrs).forEach((key) => {
    reference[key] = attrs[key]
  })

  await reference.save()
  return { reference }
}

export const deleteReference = async (input, { activeProfileId, role }) => {
  const { id } = input
  const reference = await models.Reference.findById(id)
  if (reference.profile !== activeProfileId && role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.UPDATE_REFERENCE_FORBIDDEN, {
      profileId: reference.profile,
    })
  }
  await models.Reference.deleteById(id)
  return { deleted: true }
}

export const requestReference = async (activeProfileId, input) => {
  const { profileId } = input

  // check if the same request is already existing
  const existingRequest = await models.Request.findOne({
    requestor: activeProfileId,
    recipient: profileId,
    type: RequestType.Reference,
    status: RequestStatus.Pending,
  })
  if (existingRequest) {
    throw new UserInputError(ERRORS_BY_CODE.REQUEST_ALREADY_EXISTS)
  }

  try {
    // create a new request
    const referencesRequest = await models.Request.create({
      requestor: activeProfileId,
      recipient: profileId,
      type: RequestType.Reference,
      status: RequestStatus.Pending,
    })

    await sendRequestReference({
      ...(await prepareRequestEmailTemplate(profileId, activeProfileId)),
      confirmActionRedirectUrl: `${FRONTEND_URL}/action/references-request/accept/${referencesRequest.id}`,
    })
  } catch (err) {
    console.error('Failed to create references request: ', err)
    throw new ApolloError('Cannot create references request')
  }

  return { requested: true }
}

export const approveReferencesRequest = async (activeProfileId, input) => {
  const { requestId } = input

  // check if the same request is already existing
  const existingRequest = await models.Request.findOne({
    _id: requestId,
    recipient: activeProfileId,
    type: RequestType.Reference,
    status: RequestStatus.Pending,
  })
  if (!existingRequest) {
    return {
      requested: false,
      errors: [
        new UserInputError(ERRORS_BY_CODE.INVALID_REFERENCE_ID, {
          referenceId: requestId,
        }),
      ],
    }
  }

  // accept reference request
  const [recipient, requestor] = await Promise.all([
    simpleProfileLoader.load(existingRequest.recipient),
    simpleProfileLoader.load(existingRequest.requestor),
  ])

  if (!recipient) {
    return {
      requested: false,
      errors: [
        new UserInputError(ERRORS_BY_CODE.INVALID_REFERENCE_RECIPIENT_ID, {
          profileId: recipient,
        }),
      ],
    }
  }
  if (!requestor) {
    return {
      requested: false,
      errors: [
        new UserInputError(ERRORS_BY_CODE.INVALID_REFERENCE_REQUESTOR_ID, {
          profileId: requestor,
        }),
      ],
    }
  }

  await sendReferences({
    requestorEmail: requestor.email,
    requestorFirstName: requestor.firstName,
    profileId: recipient.id,
    profileFirstName: recipient.firstName,
    References: (
      await getReferences(recipient)
    ).map((item) => ({
      name: item.name,
      relationship: item.relationship.join(' '),
      siteRole: item.siteRole,
      phone: item.phone,
      email: item.email,
    })),
  })

  // update request status as accepted
  existingRequest.status = RequestStatus.Accepted
  await existingRequest.save()

  return {
    success: true,
    profile: requestor,
  }
}

export async function deleteReferences(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ profile: profileId }, { profileShabbatMember: profileId }],
  }
  if (shouldHardDelete) {
    await models.Reference.deleteMany(whereOptions)
  } else {
    await models.Reference.delete(whereOptions).exec()
  }
}

export async function restoreReferences(profileId) {
  const whereOptions = {
    $or: [{ profile: profileId }, { profileShabbatMember: profileId }],
  }
  await models.Reference.restore(whereOptions).exec()
}
