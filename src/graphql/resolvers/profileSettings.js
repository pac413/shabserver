import { ForbiddenError } from 'apollo-server-express'
import { combineResolvers, skip } from 'graphql-resolvers'
import {
  getProfileSettings,
  getSettingsWithDefaults,
  updateSettings,
} from 'Connectors/profileSettings'
import { ERRORS_BY_CODE } from 'Errors'
import { FeedContentSetting } from 'Models/profileSettings/enums'
import { Roles } from 'Utils/globals'

export const canTouchProfileSettings = (
  parent,
  { input: { profileId } },
  ctx
) => {
  const { activeProfileId, role } = ctx
  if (profileId && profileId !== activeProfileId && role !== Roles.Admin) {
    throw new ForbiddenError(ERRORS_BY_CODE.PROFILE_UPDATE_FORBIDDEN, {
      profileId,
    })
  }
  return skip
}

export default {
  Query: {
    profileSettings: combineResolvers(
      canTouchProfileSettings,
      async (_, { input }, { activeProfileId }) => {
        const { profileId } = input
        const settings = await getProfileSettings(profileId || activeProfileId)
        return {
          profileId: profileId || activeProfileId,
          settings,
        }
      }
    ),
  },
  Mutation: {
    updateProfileSettingsBooleans: combineResolvers(
      canTouchProfileSettings,
      async (_, { input: { profileId, setting, value } }, context) => {
        const { activeProfileId } = context
        const settings = await updateSettings({
          profileId: profileId || activeProfileId,
          setting,
          value,
        })
        return {
          message: 'updated',
          profileId: profileId || activeProfileId,
          settings: getSettingsWithDefaults(settings.toObject()),
        }
      }
    ),
    updateProfileSettingsMessagingPrivacyTier: combineResolvers(
      canTouchProfileSettings,
      async (_, { input: { profileId, value } }, context) => {
        const { activeProfileId } = context
        const settings = await updateSettings({
          profileId: profileId || activeProfileId,
          setting: 'messagingPrivacy',
          value,
        })
        return {
          message: 'updated',
          profileId: profileId || activeProfileId,
          settings: getSettingsWithDefaults(settings.toObject()),
        }
      }
    ),
    updateProfileSettingsPostPrivacy: combineResolvers(
      canTouchProfileSettings,
      async (_, { input: { profileId, value } }, context) => {
        const { activeProfileId } = context
        const settings = await updateSettings({
          profileId: profileId || activeProfileId,
          setting: 'postPrivacy',
          value,
        })
        return {
          message: 'updated',
          profileId: profileId || activeProfileId,
          settings: getSettingsWithDefaults(settings.toObject()),
        }
      }
    ),
    updateProfileSettingsFeedContent: combineResolvers(
      canTouchProfileSettings,
      async (_, { input: { profileId, value } }, context) => {
        const { activeProfileId, role } = context
        // If you are not an admin, you cannot set `FeedContentSetting` as `ALL`
        if (role !== Roles.Admin && value === FeedContentSetting.ALL) {
          throw new ForbiddenError(ERRORS_BY_CODE.ADMIN_ONLY_ALLOWED)
        }

        const settings = await updateSettings({
          profileId: profileId || activeProfileId,
          setting: 'feedContent',
          value,
        })
        return {
          message: 'updated',
          profileId: profileId || activeProfileId,
          settings: getSettingsWithDefaults(settings.toObject()),
        }
      }
    ),
  },
}
