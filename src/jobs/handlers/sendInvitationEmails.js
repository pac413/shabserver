import { prepareNewHostingEmail } from 'Connectors/hosting'
import { sendNewHostingsEmail } from 'Services/email'
import { jobQueue } from 'Jobs/jobQueue'

export const sendInvitationEmails = async ({ hostings, retryAttempts = 0 }) => {
  const failedHostings = []
  await Promise.all(
    hostings.map(async (hosting) => {
      try {
        const body = await prepareNewHostingEmail(hosting._id)
        await sendNewHostingsEmail(body)
      } catch (e) {
        failedHostings.push(hosting)
        console.error('Email new hosting failed', e)
      }
    })
  )

  if (failedHostings.length > 0 && retryAttempts < 3) {
    // Re-schedule the failedHostings
    await jobQueue.add(
      jobQueue.jobs.SendInvitationEmails,
      {
        hostings: failedHostings,
        retryAttempts: retryAttempts + 1,
      },
      { DelaySeconds: 10 } // Try again in 10s
    )
  }
}
