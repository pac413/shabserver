import { v4 as uuid } from 'uuid'
import { AWS } from 'Services'

const sqs = AWS.getSQSClient()

const addJob = async (jobName, data = null, options = {}) => {
  const { DelaySeconds } = options
  const queueUrl = AWS.getWorkerSQSQueueUrl()
  const messageId = uuid()
  const sqsParams = {
    QueueUrl: queueUrl,
    ...(DelaySeconds ? { DelaySeconds } : {}),
    MessageBody: messageId,
    // MessageGroupId: messageId,
    MessageAttributes: {
      name: { DataType: 'String', StringValue: jobName },
      ...(data
        ? { data: { DataType: 'String', StringValue: JSON.stringify(data) } }
        : {}),
    },
  }
  try {
    await sqs.sendMessage(sqsParams).promise()
    console.info('Successfully queued job')
  } catch (error) {
    console.error('Failed to add new job data to the queue: ', error)
  }
  return true
}

const jobs = {
  DeleteAccount: 'delete_account',
  DisposeExpiredRefreshToken: 'dispose_expired_refresh_token',
  FeedItemViewed: 'feed_item_viewed',
  GenerateBirthdayPosts: 'generate_birthday_posts',
  PostUpdated: 'post_updated',
  ProfileViewed: 'profile_viewed',
  ResetActivelyLooking: 'reset_actively_looking',
  NewMessageSent: 'new_message_sent',
  RemindHostingEndorsements: 'remind_hosting_endorsements',
  SendHostingEndorsementNotification: 'send_hosting_endorsement_notification',
  SendInvitationEmails: 'send_invitation_emails',
}

export const jobQueue = {
  add: addJob,
  jobs,
}
