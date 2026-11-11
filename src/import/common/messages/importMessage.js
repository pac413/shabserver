import { importMedia } from 'Import/common/media/importMedia'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { MessageStatus, MessageType } from 'Models/message/enums'

const populateFieldsFromData = (data, profileId, importedAt) => {
  return {
    conversation: data.conversation,
    text: data.text,
    sender: data.sender,
    recipients: data.recipients.map((recipient) => ({
      recipient: recipient.recipient,
      status: MessageStatus.READ,
      deleted: recipient.deleted,
      deletedDate: null,
      read: recipient.read,
      readDate: recipient.readDate,
    })),
    flagged: [],
    status: data.status,
    productionId: data._id,
    dateSent: data.dateSent,
    createdAt: data.dateSent,
    updatedAt: data.dateSent,
    attachments: data.attachments,
    type: data.type || MessageType.TEXT,
    importedAt,
  }
}

const findExisting = async (data, profileId) => {
  const message = await models.Message.findOne({ productionId: data._id })
  return message
}

const create = async (data, profileId, importedAt) => {
  const fields = populateFieldsFromData(data, profileId, importedAt)
  const message = await models.Message.create(fields)
  message.createdAt = data.createdAt
  message.updatedAt = data.updatedAt
  await message.save()
  console.log({
    event: 'MESSAGE',
    message: `Created message ${data._id} for ${profileId}`,
    profileId,
  })
  return message
}

const update = async (data, message, profileId, importedAt) => {
  const lastModified = data.updatedAt ? new Date(data.updatedAt) : null
  const newImportedAt = new Date(importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'MESSAGE',
      message: `Skipped message for ${profileId}`,
      profileId,
    })
    return message
  }

  const { _id, ...updates } = populateFieldsFromData(
    data,
    profileId,
    importedAt
  )
  await models.Message.updateOne({ productionId: _id }, updates, {
    timestamps: false,
  })
  console.log({
    event: 'MESSAGE',
    message: `Updated message for ${profileId}`,
    profileId,
  })
  return message
}

export const importMessage = async (data, profileId, importedAt) => {
  console.log({
    event: 'IMPORT_MESSAGE',
    message: `Importing message ${data._id}`,
    profileId,
    data,
  })

  const conversation = await models.Conversation.findOne({
    'participants.participant': {
      $all: [
        data.sender,
        ...data.recipients.map((recipient) => recipient.recipient),
      ],
    },
  })
  if (!conversation) {
    logger.alert({
      event: 'REPORT_MESSAGES',
      status: 'error',
      message: data,
      profileId,
      reason: 'no_conversation_found',
    })
    return
  }
  data.conversation = conversation._id

  if (
    new Date(conversation.lastActive).getTime() <
    new Date(data.dateSent).getTime()
  ) {
    await models.Conversation.updateOne(
      { _id: conversation._id },
      {
        lastActive: new Date(data.dateSent),
      }
    )
  }

  const existing = await findExisting(data, profileId)
  let importedMessage
  if (existing) {
    importedMessage = await update(data, existing, profileId, importedAt)
  } else {
    importedMessage = await create(data, profileId, importedAt)
  }

  if (data.picture && data.picture.original) {
    const { original, thumbnail, createdAt, updatedAt } = data.picture
    const media = await importMedia(
      {
        original,
        ownerId: profileId,
        mediaType: MediaType.PICTURE,
        mediaSubType: MediaSubType.MESSAGE,
        reference: {
          conversationId: data.conversation,
        },
        mediaKey: `${data._id}_message_attachment`,
        socialProvider: false,
        thumbnails: { thumbnail },
        createdAt,
        updatedAt,
      },
      importedAt
    )

    importedMessage.attachments = [media._id]
    await models.Message.updateOne(
      { _id: importedMessage._id },
      { attachments: [media._id] }
    )
  }

  return importedMessage
}
