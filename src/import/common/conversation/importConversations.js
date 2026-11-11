import { uniq } from 'lodash'
import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'

const isValidData = (data) => {
  data.participants = uniq(data.participants)

  return (
    data.participants.every((participant) =>
      validProfileIds.includes(participant)
    ) && data.participants.length > 1
  )
}

const populateFieldsFromData = (data, profileId, importedAt) => {
  return {
    participants: data.participants.map((participant) => ({
      participant,
      status: ConversationParticipantStatus.APPROVED,
      unreadMessages: [],
    })),
    lastActive: data.lastActive,
    importedAt,
  }
}

export const importConversations = async (
  conversations,
  profileId,
  importedAt
) => {
  const validConversations = conversations.filter((conversation) =>
    isValidData(conversation)
  )
  console.log({
    event: 'IMPORT_CONVERSATIONS',
    message: `Importing ${validConversations.length}/${conversations.length} conversations for ${profileId}`,
    profileId,
  })

  await models.Conversation.bulkWrite(
    validConversations.map((data) => {
      const fields = populateFieldsFromData(data, profileId, importedAt)
      return {
        replaceOne: {
          filter: {
            'participants.participant': { $all: data.participants },
          },
          replacement: fields,
          upsert: true,
          timestamps: false,
        },
      }
    })
  )
}
