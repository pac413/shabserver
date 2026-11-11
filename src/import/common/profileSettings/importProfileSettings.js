import { defaultSettings } from 'Connectors/profileSettings'
import { parseMigratedDate } from 'Import/common/helpers'
import models from 'Models'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const populateFieldsFromData = (data, profileId, importedAt) => {
  return IS_MOCK_IMPORT
    ? {
        ...defaultSettings,
        profile: profileId,
        importedAt,
      }
    : {
        ...defaultSettings,
        messagingPrivacy: data.messagingPrivacy,
        anonymousBrowsing: data.anonymousBrowsing,
        friendRequestNeeded: data.friendRequestNeeded,
        hideAllMedia: data.hideAllMedia,
        messagesByEmail: data.messagesByEmail,
        messagesByPush: data.messagesByPush,
        invitesByEmail: data.invitesByEmail,
        invitesByPush: data.invitesByPush,
        profileViewsByEmail: data.profileViewsByEmail,
        profileViewsByPush: data.profileViewsByPush,
        newFriendsByEmail: data.newFriendsByEmail,
        newFriendsByPush: data.newFriendsByPush,
        likesByEmail: data.likesByEmail,
        likesByPush: data.likesByPush,
        commentsByEmail: data.commentsByEmail,
        commentsByPush: data.commentsByPush,
        friendRequestByEmail: data.friendRequestByEmail,
        friendRequestByPush: data.friendRequestByPush,
        weeklyActivitySummaryEmail: data.weeklyActivitySummaryEmail,
        feedContent: data.feedContent,
        postPrivacy: data.postPrivacy,
        profile: profileId,
        createdAt: parseMigratedDate(data.createdAt) || importedAt,
        updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
        importedAt,
      }
}

const findExisting = async (data, profileId) => {
  const profileSettings = await models.ProfileSettings.findOne({
    profile: profileId,
  })
  return profileSettings
}

const create = async (data, profileId, importedAt) => {
  const fields = populateFieldsFromData(data, profileId, importedAt)
  const profileSettings = await models.ProfileSettings.create(fields)
  console.log({
    event: 'PROFILESETTINGS',
    message: `Created profile settings for ${profileId}`,
    profileId,
  })
  return profileSettings
}

const update = async (data, profileSettings, profileId, importedAt) => {
  const lastModified = data.updatedAt ? new Date(data.updatedAt) : null
  const newImportedAt = new Date(importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'PROFILESETTINGS',
      message: `Skipped profile settings for ${profileId}`,
      profileId,
    })
    return profileSettings
  }

  const { _id, ...updates } = populateFieldsFromData(
    data,
    profileId,
    importedAt
  )
  await models.ProfileSettings.updateOne({ _id }, updates)
  console.log({
    event: 'PROFILESETTINGS',
    message: `Updated profile settings for ${profileId}`,
    profileId,
  })
  return profileSettings
}

export const importProfileSettings = async (data, profileId, importedAt) => {
  console.log({
    event: 'IMPORT_PROFILESETTINGS',
    message: `Importing profile settings for ${profileId}`,
    profileId,
    data,
  })

  const existing = await findExisting(data, profileId)
  let profileSetting
  if (existing) {
    profileSetting = await update(data, existing, profileId, importedAt)
  } else {
    profileSetting = await create(data, profileId, importedAt)
  }

  return profileSetting
}
