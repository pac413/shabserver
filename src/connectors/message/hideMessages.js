import models from 'Models'

export default async function hideMessages(profileId) {
  await models.Message.updateMany(
    { $or: [{ sender: profileId }, { 'recipients.recipient': profileId }] },
    { hidden: true }
  )
}
