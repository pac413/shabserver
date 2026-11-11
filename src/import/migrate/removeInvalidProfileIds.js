import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'

/**
 * Triggered when process.env.MIGRATE = removeInvalidProfileIds
 *
 * Remove invalid profile ids from our migrated data
 */
export const removeInvalidProfileIds = async () => {
  await models.Endorsement.deleteMany({
    endorser: { $nin: validProfileIds },
  })
  await models.Friendship.deleteMany({
    $or: [
      {
        requester: { $nin: validProfileIds },
      },
      {
        members: { $elemMatch: { $nin: validProfileIds } },
      },
    ],
  })
  await models.Hosting.deleteMany({
    $or: [
      {
        host: { $nin: validProfileIds },
      },
      {
        guest: { $nin: validProfileIds },
      },
    ],
  })
  await models.Conversation.deleteMany({
    'participants.participant': { $nin: validProfileIds },
  })
  await models.Message.deleteMany({
    'recipients.recipient': { $nin: validProfileIds },
  })
  await models.ProfileView.deleteMany({
    viewer: { $nin: validProfileIds },
  })
}
