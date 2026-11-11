import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import { Roles } from 'Utils/globals'

export const buildContext = async (tokenPayload) => {
  const { activeProfileId, activeUserId, locale, role } = tokenPayload || {}

  const unauthorisedPayload = {
    activeProfileId: null,
    activeUserId: null,
    role: null,
    locale: locale || 'en',
  }

  if (!tokenPayload) {
    return unauthorisedPayload
  }

  if (!activeProfileId || !activeUserId) {
    return unauthorisedPayload
  }

  const activeProfile = await simpleProfileLoader.load(activeProfileId)
  if (!activeProfile) {
    return unauthorisedPayload
  }

  return {
    activeProfileId,
    activeUserId,
    locale: activeProfile.primaryLocale || locale || 'en',
    role,
  }
}

export const isPrivateAllowed = (profileId, context) => {
  const { activeProfileId, role } = context
  return role === Roles.Admin || activeProfileId === profileId
}
