import { migrateSingleMessages } from './utils/messages'

/**
 * Triggered when process.env.MIGRATE=messages
 *
 * Migrate messages
 * - Messages
 * - Conversations
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const messages = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'MESSAGES',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleMessages(profileId)
}
