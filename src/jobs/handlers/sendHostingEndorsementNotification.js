import {
  createEndorsementRequestNotification,
  sendEndorsementRequestEmails,
} from 'Connectors/endorsement'
import simpleProfileLoader from 'DataLoaders/simpleProfileLoader'
import models from 'Models'

export const sendHostingEndorsementNotification = async (hosting) => {
  const [hostProfile, guestProfile] = await Promise.all([
    simpleProfileLoader.load(hosting.host),
    simpleProfileLoader.load(hosting.guest),
  ])
  if (!hostProfile || !guestProfile) {
    console.info('Skipping sending hosting endorsement notifications')
    return
  }
  await Promise.all([
    createEndorsementRequestNotification({
      hosting,
      hostProfile,
      guestProfile,
    }),
    sendEndorsementRequestEmails({
      hostProfile,
      guestProfile,
    }),
  ])

  const date = new Date()
  await models.Hosting.updateOne(
    { _id: hosting._id },
    {
      notifiedHostEndorsementAt: date,
      notifiedGuestEndorsementAt: date,
    }
  )
}
