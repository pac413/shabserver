import models from 'Models'

export default async function restoreConversations(profileId) {
  const whereOptions = { members: profileId }
  await models.Friendship.restore(whereOptions).exec()
}
