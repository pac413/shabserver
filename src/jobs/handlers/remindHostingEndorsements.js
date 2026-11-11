import moment from 'moment'
import models from 'Models'
import { HostingStatus } from 'Models/hosting/enums'
import { jobQueue } from '../jobQueue'

export const remindHostingEndorsements = async () => {
  const hostings = await models.Hosting.find({
    date: {
      $gt: moment().subtract(7, 'd').utc().toDate(),
      $lte: moment().utc().toDate(),
    },
    status: HostingStatus.ACCEPTED,
  }).lean()

  console.log(
    `enqueued reminding hosting endorsements for ${hostings.length} hostings`
  )
  for (const hosting of hostings) {
    jobQueue.add(
      jobQueue.jobs.SendHostingEndorsementNotification,
      {
        hosting,
      },
      process.env.NODE_ENV === 'local'
        ? {}
        : { DelaySeconds: Math.ceil(Math.random() * 900) } // random delay in the next 15 mins (maximum allowed value)
    )
  }
}
