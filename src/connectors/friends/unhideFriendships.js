import models from 'Models'

export default async function unhideFriendships(profileId) {
  await models.Friendship.updateMany({ members: profileId }, { hidden: false })
}
