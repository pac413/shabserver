import { v4 as uuid } from 'uuid'
import models from 'Models'

export const updateConversationsIds = async () => {
  const conversationCursor = models.Conversation.find({
    _id: {
      $not: {
        $regex:
          /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
      },
    },
  }).cursor()

  let index = 0
  for await (const conversation of conversationCursor) {
    const updatedConversation = {
      ...conversation.toObject(),
      _id: uuid(),
    }
    await Promise.all([
      models.Conversation.create(updatedConversation),
      models.Message.updateMany(
        { conversation: conversation._id },
        { conversation: updatedConversation._id }
      ),
    ])
    await conversation.remove()

    index++
    console.log(`${index}: UPDATE_CONVERSATION_IDS`)
  }
}
