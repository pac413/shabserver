import { getActionBlockingProfileIds } from 'Connectors/blocking'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'

export default async function getPendingConversations(
  input,
  { activeProfileId }
) {
  const { limit, offset } = input
  const forbiddenProfileIds = await getActionBlockingProfileIds(activeProfileId)

  const match = {
    hidden: { $ne: true },
    participants: {
      $elemMatch: {
        participant: activeProfileId,
        status: ConversationParticipantStatus.PENDING,
      },
    },
    'participants.participant': { $nin: forbiddenProfileIds },
  }

  const total = await models.Conversation.countDocuments(match)
  if (total === 0) {
    return { total, conversations: [] }
  }

  const conversations = await models.Conversation.find(match)
    .sort({
      lastActive: -1,
      updatedAt: -1,
      createdAt: -1,
    })
    .skip(offset)
    .limit(limit)
  return { total, conversations }
}
