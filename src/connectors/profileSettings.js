import profileSettingsLoader from 'DataLoaders/profileSettingsLoader'
import models from 'Models'
import {
  MessagingPrivacyTiers,
  FeedContentSetting,
  PostPrivacySetting,
} from 'Models/profileSettings/enums'

export const defaultSettings = {
  messagingPrivacy: MessagingPrivacyTiers.CONNECTIONS_OTHERS_REQUEST,
  anonymousBrowsing: false,
  friendRequestNeeded: true,
  hideAllMedia: false,
  messagesByEmail: true,
  messagesByPush: false,
  invitesByEmail: true,
  invitesByPush: false,
  profileViewsByEmail: false,
  profileViewsByPush: false,
  newFriendsByEmail: true,
  newFriendsByPush: false,
  likesByEmail: false,
  likesByPush: false,
  commentsByEmail: false,
  commentsByPush: false,
  friendRequestByEmail: true,
  friendRequestByPush: false,
  weeklyActivitySummaryEmail: false,
  feedContent: FeedContentSetting.TRENDING,
  postPrivacy: PostPrivacySetting.ALL,
  paginatedSearchResult: false,
}

export const getProfileSettings = async (profileId) => {
  try {
    const profileSettings = await profileSettingsLoader.load(profileId)
    return getSettingsWithDefaults(profileSettings)
  } catch (e) {
    return { ...defaultSettings }
  }
}

/**
 * Returns profile settings after applying the default settings
 * @param {*} profileSettings ProfileSettings pure Object (Mongodb document should be passed after .toObject())
 */
export const getSettingsWithDefaults = (profileSettings) => {
  if (!profileSettings) {
    return { ...defaultSettings }
  }
  return {
    ...defaultSettings,
    ...profileSettings,
  }
}

export const updateSettings = async ({ profileId, setting, value }) => {
  const exitingProfileSettings = await models.ProfileSettings.findOne({
    profile: profileId,
  })

  // If same property already exists, no need to update.
  if (
    exitingProfileSettings &&
    (exitingProfileSettings[setting] === value ||
      (!exitingProfileSettings[setting] && value === null))
  ) {
    return exitingProfileSettings
  }

  const fieldToUpdate = {}
  const opt = value === null ? '$unset' : '$set'
  fieldToUpdate[opt] = { [setting]: value }

  const newSettings = await models.ProfileSettings.findOneAndUpdate(
    { profile: profileId },
    fieldToUpdate,
    {
      new: true,
      upsert: true,
    }
  )

  if (setting === 'postPrivacy') {
    const postPrivacySetting = value || defaultSettings.postPrivacy
    await models.Post.updateMany(
      { postedBy: profileId },
      { privacySetting: postPrivacySetting }
    )
  }

  // Clear ProfileSettingsLoader to get the up-to-dated settings for next time load
  profileSettingsLoader.clear(profileId)
  return newSettings
}

export const createProfileSettings = async (profileId, settings = {}) => {
  const exitingProfileSettings = await models.ProfileSettings.findOne({
    profile: profileId,
  })
  if (exitingProfileSettings) {
    await exitingProfileSettings.destroy()
  }

  // Clear ProfileSettingsLoader to get the up-to-dated settings for next time load
  profileSettingsLoader.clear(profileId)

  return models.ProfileSettings.create({
    ...defaultSettings,
    ...settings,
    profile: profileId,
  })
}

export async function deleteProfileSettings(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = { profile: profileId }
  if (shouldHardDelete) {
    await models.ProfileSettings.deleteMany(whereOptions)
  } else {
    await models.ProfileSettings.delete(whereOptions).exec()
  }
}

export async function restoreProfileSettings(profileId) {
  const whereOptions = { profile: profileId }
  await models.ProfileSettings.restore(whereOptions).exec()
}
