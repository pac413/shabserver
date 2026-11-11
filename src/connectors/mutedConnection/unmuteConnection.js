import models from 'Models'
import { UserInputError } from 'apollo-server-errors'
import { ERRORS_BY_CODE } from 'Errors'
import connectionsThatMutedMe from './cache/connectionsThatMutedMe'
import connectionsMutedByMe from './cache/connectionsMutedByMe'

export default async function unmuteConnection({ profileId }, context) {
  const { activeProfileId } = context

  const existingMute = await models.MutedConnection.findOne({
    profileId: activeProfileId,
    mutedProfileId: profileId,
  })

  if (!existingMute) {
    throw new UserInputError(ERRORS_BY_CODE.PROFILE_NOT_MUTED, {
      profileId,
    })
  }

  await models.MutedConnection.deleteOne({ _id: existingMute._id })
  await Promise.all([
    connectionsMutedByMe.clearOne(activeProfileId, profileId),
    connectionsThatMutedMe.clearOne(profileId, activeProfileId),
  ])

  return true
}
