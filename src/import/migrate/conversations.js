import { migrateSingleConversations } from './utils/conversations'

/**
 * Triggered when process.env.MIGRATE=conversations
 *
 * Migrate conversations
 * - Conversations
 *
 * Used env variables:
 * - process.env.PROFILE_ID (required)
 */
export const conversations = async () => {
  const profileId = process.env.PROFILE_ID
  if (!profileId) {
    console.error({
      event: 'CONVERSATIONS',
      message: 'PROFILE_ID environment variable is missing',
    })
    return
  }

  await migrateSingleConversations(profileId)
}
