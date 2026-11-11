import escapeRegex from 'escape-string-regexp'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'

export default async function searchConversations(input, { activeProfileId }) {
  const { limit, offset, search } = input
  const forbiddenProfileIds = await getActionBlockingProfileIds(activeProfileId)

  const match = {
    hidden: { $ne: true },
    participants: {
      $elemMatch: {
        // This is to filter non-archived conversation for the active profile
        participant: activeProfileId,
        status: {
          $in: [
            ConversationParticipantStatus.APPROVED,
            ConversationParticipantStatus.PENDING,
          ],
        },
      },
    },
    'participants.participant': { $nin: forbiddenProfileIds },
  }

  // If search is null/undefined or empty string, just do the find instead of aggregate
  if (!search) {
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

  // Aggregate pipeline to search keyword with firstName + lastName of other participants in the conversation.
  const aggregatePipelines = [
    { $match: match },
    { $addFields: { participantId: '$participants.participant' } },
    { $unwind: '$participantId' },
    { $match: { participantId: { $ne: activeProfileId } } },
    {
      $lookup: {
        from: 'profiles',
        localField: 'participantId',
        foreignField: '_id',
        as: 'opponent',
      },
    },
    {
      $project: {
        _id: 1,
        participants: 1,
        createdAt: 1,
        updatedAt: 1,
        lastActive: 1,
        opponentName: {
          $concat: [
            { $arrayElemAt: ['$opponent.firstName', 0] },
            ' ',
            { $arrayElemAt: ['$opponent.lastName', 0] },
          ],
        },
      },
    },
    { $match: { opponentName: new RegExp(escapeRegex(search), 'i') } },
  ]

  const count = await models.Conversation.aggregate([
    ...aggregatePipelines,
    { $count: 'total' },
  ])

  const total = count && count.length > 0 ? count[0].total : 0
  if (total === 0) {
    return { total, conversations: [] }
  }

  const conversations = await models.Conversation.aggregate([
    ...aggregatePipelines,
    {
      $sort: {
        lastActive: -1,
        updatedAt: -1,
        createdAt: -1,
      },
    },
    { $skip: offset },
    { $limit: limit },
  ])

  return { total, conversations }
}
