import models from 'Models'

export default async function hideFriendships(profileId) {
  await models.Friendship.updateMany({ members: profileId }, { hidden: true })
}
