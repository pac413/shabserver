import { migrateBulkConversations } from './utils/conversations'
import { migrateBulkEndorsements } from './utils/endorsements'
import { migrateBulkFriendships } from './utils/friendships'
import { migrateBulkHostings } from './utils/hostings'
import { migrateBulkMessages } from './utils/messages'
import { migrateBulkPosts } from './utils/posts'
import { migrateBulkProfiles } from './utils/profile'
import { migrateBulkProfileSettings } from './utils/profileSettings'
import { migrateBulkProfileViews } from './utils/profileViews'
import { migrateBulkReferences } from './utils/references'
import { updateConversationsIds } from './updateConversationsIds'
import { updateProfileHandles } from './updateProfileHandles'

export const migrateAll = async () => {
  await migrateBulkProfiles()
  await updateProfileHandles()
  await migrateBulkProfileSettings()
  await migrateBulkProfileViews()
  await migrateBulkFriendships()
  await migrateBulkEndorsements()
  await migrateBulkReferences()
  await migrateBulkHostings()
  await migrateBulkPosts()
  await migrateBulkConversations()
  await migrateBulkMessages()
  await updateConversationsIds()
}
