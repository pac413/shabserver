import models from 'Models'

export default async function deleteMessages(
  profileId,
  shouldHardDelete = false
) {
  const whereOptions = {
    $or: [{ sender: profileId }, { 'recipients.recipient': profileId }],
  }
  if (shouldHardDelete) {
    await models.Message.deleteMany(whereOptions)
  } else {
    await models.Message.delete(whereOptions).exec()
  }
}
