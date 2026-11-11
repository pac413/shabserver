import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'

const isValidData = (data) => {
  return data.participants.every(({ participant }) =>
    validProfileIds.includes(participant)
  )
}

const populateFieldsFromData = (data, profileId, importedAt) => {
  return {
    participants: data.participants,
    lastActive: data.lastActive,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    importedAt,
  }
}

const findExisting = async (data, profileId) => {
  const conversation = await models.Conversation.findOne({
    'participants.participant': {
      $all: data.participants.map(({ participant }) => participant),
    },
  })
  return conversation
}

const create = async (data, profileId, importedAt) => {
  const fields = populateFieldsFromData(data, profileId, importedAt)
  const conversation = await models.Conversation.create(fields)
  conversation.createdAt = data.createdAt
  conversation.updatedAt = data.updatedAt
  await conversation.save()
  console.log({
    event: 'CONVERSATION',
    action: 'Created',
    message: `Created conversation for ${profileId}`,
    profileId,
  })
  return conversation
}

const update = async (data, conversation, profileId, importedAt) => {
  const lastModified = data.updatedAt ? new Date(data.updatedAt) : null
  const newImportedAt = new Date(importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'CONVERSATION',
      action: 'Skipped',
      message: `Skipped conversation for ${profileId}`,
      profileId,
    })
    return conversation
  }

  const { _id, ...updates } = populateFieldsFromData(
    data,
    profileId,
    importedAt
  )
  if (
    new Date(conversation.createdAt).getTime() >
    new Date(data.createdAt).getTime()
  ) {
    updates.createdAt = data.createdAt
    updates.updatedAt = data.updatedAt
    updates.lastActive = data.lastActive
  } else {
    updates.createdAt = conversation.createdAt
    updates.updatedAt = conversation.updatedAt
    updates.lastActive = conversation.lastActive
  }

  await models.Conversation.updateOne({ _id }, updates, { timestamps: false })

  console.log({
    event: 'CONVERSATION',
    action: 'Updated',
    conversationId: _id,
    message: `Updated conversation for ${profileId}`,
    profileId,
  })
  return conversation
}

export const importConversation = async (data, profileId, importedAt) => {
  console.log({
    event: 'IMPORT_CONVERSATION',
    message: 'Importing conversation',
    data,
    profileId,
  })

  const isValid = isValidData(data)
  if (!isValid) {
    console.log({
      event: 'IMPORT_CONVERSATION',
      message: 'Skipped because of Invalid data',
      action: 'Skipped',
      data,
      profileId,
    })
    return
  }
  const existing = await findExisting(data, profileId)
  let importedConversation
  if (existing) {
    importedConversation = await update(data, existing, profileId, importedAt)
  } else {
    importedConversation = await create(data, profileId, importedAt)
  }

  return importedConversation
}
