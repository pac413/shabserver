import models from 'Models'

export const deleteAccount = async (profileId) => {
  const profile = await models.Profile.findById(profileId)
    .select({ _id: 1, user: 1 })
    .lean()
  console.log(`Deleting profile ${profile._id}`)
  await models.User.delete({ _id: profile.user })
  await models.Profile.delete({ _id: profileId })
  await models.GuestProfile.delete({ profile: profileId })
  await models.HostProfile.delete({ profile: profileId })
  await models.DatingProfile.delete({ profile: profileId })
  // TODO: Friends endorsements attachments references
}
