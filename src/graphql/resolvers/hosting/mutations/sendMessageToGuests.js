import * as Sentry from '@sentry/node'
import BluebirdPromise from 'bluebird'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import { createConversationForHosting } from 'Connectors/conversations'
import { getFlags } from 'Connectors/profile'
import { isMessagingRestricted } from 'Connectors/user'
import { ERRORS_BY_CODE } from 'Errors'
import models from 'Models'
import { ProfileFlagScopes } from 'Models/profile/enums'

export const sendMessageToGuests = async (_, { input }, context) => {
  const { hostingIds, message } = input
  const { activeProfileId } = context

  const activeProfile = await models.Profile.findById(activeProfileId)
    // phone and location is used by getFlags function
    .select({ phone: 1, location: 1, restrictions: 1 })
    .lean()
  if (isMessagingRestricted(activeProfile)) {
    return {
      __typename: 'SendMessageToGuestsFailure',
      message: ERRORS_BY_CODE.INCOMPLETE_PROFILE,
    }
  }
  const flags = getFlags(activeProfile)
    ? getFlags(activeProfile).filter((flag) =>
        flag.scopes.includes(ProfileFlagScopes.HOSTING)
      )
    : []
  if (flags.length > 0) {
    return {
      __typename: 'SendMessageToGuestsFailure',
      message: ERRORS_BY_CODE.INCOMPLETE_PROFILE,
    }
  }

  let success = 0
  let failure = 0
  const blockedProfileIds = await getActionBlockingProfileIds(activeProfileId)
  const hostings = await models.Hosting.find({
    _id: { $in: hostingIds },
    guest: { $nin: blockedProfileIds },
    hidden: { $ne: true },
  }).lean()

  await BluebirdPromise.map(
    hostings,
    async (hosting) => {
      try {
        await createConversationForHosting(
          {
            hosting,
            note: message,
            isSendingNewHostingMessage: false,
          },
          context
        )
        success++
      } catch (error) {
        failure++
        Sentry.captureException(error)
        console.error('Failed to send the message to the guest', {
          hosting,
          error,
        })
      }
    },
    {
      concurrency: 10,
    }
  )

  return {
    __typename: 'SendMessageToGuestsSuccess',
    success,
    failure,
  }
}
