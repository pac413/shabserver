import models from 'Models'

export default async function deleteFriendships(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = { members: profileId }
  if (shouldHardDelete) {
    await models.Friendship.deleteMany(whereOptions)
  } else {
    await models.Friendship.delete(whereOptions).exec()
  }
}
