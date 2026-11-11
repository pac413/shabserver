import models from 'Models'

export default async function unhideMessages(profileId) {
  await models.Message.updateMany(
    { $or: [{ sender: profileId }, { 'recipients.recipient': profileId }] },
    { hidden: false }
  )
}
