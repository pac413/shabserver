import * as Sentry from '@sentry/node'
import { Consumer } from 'sqs-consumer'
import { jobQueue } from 'Jobs/jobQueue'
import { setupLogger, setupSentry } from 'Logger'
import { connectDb } from 'Models'
import { AWS } from 'Services'
import {
  deleteAccount,
  disposeExpiredRefreshTokens,
  generateBirthdayPosts,
  remindHostingEndorsements,
  resetActivelyLooking,
  sendHostingEndorsementNotification,
  sendUnreadMessagEmail,
  sendInvitationEmails,
} from './handlers'

setupLogger('worker')
setupSentry()

const app = Consumer.create({
  queueUrl: AWS.getWorkerSQSQueueUrl(),
  handleMessage: async (message) => {
    console.info('Started processing job: ', message.MessageId)

    const attributes = message.MessageAttributes

    const job = {
      id: message.MessageId,
      name: attributes.name.StringValue,
      data:
        attributes.data && attributes.data.StringValue
          ? JSON.parse(attributes.data.StringValue)
          : null,
    }
    console.info('Job details', job)

    console.info(`working on job: ${job.name} id:${job.id}`, job.data)

    try {
      switch (job.name) {
        case jobQueue.jobs.ResetActivelyLooking:
          await resetActivelyLooking()
          break
        case jobQueue.jobs.DisposeExpiredRefreshToken:
          await disposeExpiredRefreshTokens()
          break
        case jobQueue.jobs.DeleteAccount:
          await deleteAccount(job.data.profileId)
          break
        case jobQueue.jobs.GenerateBirthdayPosts:
          await generateBirthdayPosts()
          break
        case jobQueue.jobs.NewMessageSent:
          await sendUnreadMessagEmail(job.data.messageId)
          break
        case jobQueue.jobs.RemindHostingEndorsements:
          await remindHostingEndorsements()
          break
        case jobQueue.jobs.SendHostingEndorsementNotification:
          await sendHostingEndorsementNotification(job.data.hosting)
          break
        case jobQueue.jobs.SendInvitationEmails:
        default:
          await sendInvitationEmails(job.data)
          break
      }
      console.info(`successfully processed job: ${job.name} id:${job.id}`)
    } catch (error) {
      console.error('Failed to process job', job)
      Sentry.captureException(error)
    }
  },
  messageAttributeNames: ['name', 'data'],
  sqs: AWS.getSQSClient(),
})

app.on('error', (error) => {
  console.error('Failed to process SQS job - error', { error })
  Sentry.captureException(error)
})

app.on('processing_error', (error) => {
  console.error('Failed to process SQS job - processing_error', { error })
  Sentry.captureException(error)
})

app.on('timeout_error', (error) => {
  console.error('Failed to process SQS job - timeout_error', { error })
  Sentry.captureException(error)
})

connectDb(process.env.DB_URL).then(() => {
  app.start()
  console.info('Worker started...')
  disposeExpiredRefreshTokens()
})
