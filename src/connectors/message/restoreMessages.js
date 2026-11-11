import models from 'Models'

export default async function restoreMessages(profileId) {
  const whereOptions = {
    $or: [{ sender: profileId }, { 'recipients.recipient': profileId }],
  }
  await models.Message.restore(whereOptions).exec()
}
