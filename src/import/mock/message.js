import Promise from 'bluebird'
import moment from 'moment'
import models from 'Models'
import { ConversationParticipantStatus } from 'Models/conversation/enums'
import { MessageStatus, MessageType } from 'Models/message/enums'

const getConversation = async (participants) => {
  const conversation = await models.Conversation.find({
    participants: {
      $all: [
        {
          status: 'approved',
          unreadMessages: [],
          participant: participants[0],
        },
        {
          status: 'approved',
          unreadMessages: [],
          participant: participants[1],
        },
      ],
    },
  })
  if (conversation.length) {
    return conversation[0]
  }

  const doc = {
    participants: [
      {
        participant: participants[0],
        status: ConversationParticipantStatus.APPROVED,
      },
      {
        participant: participants[1],
        status: ConversationParticipantStatus.APPROVED,
      },
    ],
    status: ConversationParticipantStatus.APPROVED,
    lastActive: moment.utc().toDate(),
  }

  return await models.Conversation.create(doc)
}

export const runMessageImport = async () => {
  console.log('importing messages')
  await models.Conversation.deleteMany({})
  await models.Message.deleteMany({})
  const data = require('Import/mock/data/messages.json')
  const { messages } = data

  await Promise.each(messages, async (m) => {
    const { sender, recipients, text, dateSent } = m
    const { recipient } = recipients[0]
    const conversation = await getConversation([sender, recipient])
    return await models.Message.create({
      conversation: conversation._id,
      text,
      sender,
      recipients: [
        {
          recipient,
          status: MessageStatus.READ,
          readDate: dateSent,
        },
      ],
      dateSent,
      type: MessageType.TEXT,
    })
  })
  console.log('imported messages')
}
