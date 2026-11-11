import models from 'Models'

export default async function deleteConversations(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = {
    participants: {
      $elemMatch: {
        participant: profileId,
      },
    },
  }
  if (shouldHardDelete) {
    await models.Conversation.deleteMany(whereOptions)
  } else {
    await models.Conversation.delete(whereOptions).exec()
  }
}
