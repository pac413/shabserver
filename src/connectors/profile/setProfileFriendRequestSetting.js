import models from 'Models'

export default async function setProfileFriendRequestSetting(
  activeProfileId,
  input
) {
  const { whoCanFriend } = input

  const activeProfile = await models.Profile.findById(activeProfileId)
  if (!activeProfile) {
    // TODO: Graphql schema should be changed to throw error rather than `error` field.
    return {
      status: false,
      error: 'Profile do not exist',
    }
  }

  try {
    activeProfile.whoCanFriend = whoCanFriend
    await activeProfile.save()
    return {
      status: true,
    }
  } catch (error) {
    console.error('Failed to update profile setting', error)
    // TODO: Graphql schema should be changed to throw error rather than `error` field.
    return {
      status: false,
      error: 'Unable to update a setting',
    }
  }
}
