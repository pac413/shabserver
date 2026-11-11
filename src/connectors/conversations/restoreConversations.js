import models from 'Models'

export default async function restoreConversations(profileId) {
  const whereOptions = {
    participants: {
      $elemMatch: {
        participant: profileId,
      },
    },
  }
  await models.Conversation.restore(whereOptions).exec()
}
