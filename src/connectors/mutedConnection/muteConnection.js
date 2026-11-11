import models from 'Models'
import connectionsThatMutedMe from './cache/connectionsThatMutedMe'
import connectionsMutedByMe from './cache/connectionsMutedByMe'

export default async function muteConnection({ profileId }, context) {
  const { activeProfileId } = context

  const existingMute = await models.MutedConnection.findOne({
    profileId: activeProfileId,
    mutedProfileId: profileId,
  })

  if (!existingMute) {
    await models.MutedConnection.create({
      profileId: activeProfileId,
      mutedProfileId: profileId,
    })
  }

  await Promise.all([
    connectionsMutedByMe.cacheOne(activeProfileId, profileId),
    connectionsThatMutedMe.cacheOne(profileId, activeProfileId),
  ])

  return true
}
