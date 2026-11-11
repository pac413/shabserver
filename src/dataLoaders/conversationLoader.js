import DataLoader from 'dataloader'
import models from 'Models'
import { sanitizeDocument } from 'Utils'

export const createConversationLoader = () => {
  return new DataLoader(async (ids) => {
    const conversations = await models.Conversation.find({
      _id: { $in: ids },
    }).lean()
    return ids.map((id) =>
      sanitizeDocument(conversations.find((c) => id === c._id))
    )
  })
}

const conversationLoader = createConversationLoader()

export default conversationLoader
