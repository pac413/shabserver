import { getValidProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'
import { bulkConversations } from './bulkConversations'
import { bulkEndorsements } from './bulkEndorsements'
import { bulkFriendships } from './bulkFriendships'
import { bulkHostings } from './bulkHostings'
import { bulkMessages } from './bulkMessages'
import { bulkPosts } from './bulkPosts'
import { bulkPostViews } from './bulkPostViews'
import { bulkPostViewsCount } from './bulkPostViewsCount'
import { bulkProfiles, missingProfiles } from './bulkProfiles'
import { bulkProfileSettings } from './bulkProfileSettings'
import { bulkProfileViews } from './bulkProfileViews'
import { bulkReferences } from './bulkReferences'
import { conversations } from './conversations'
import { defaultMedia } from './defaultMedia'
import { deleteAll } from './deleteAll'
import { differentialMigrate } from './differentialMigrate'
import { endorsements } from './endorsements'
import { friendships } from './friendships'
import { fullProfile, missingFullProfiles } from './fullProfile'
import { hostingDates } from './hostingDates'
import { hostings } from './hostings'
import { messages } from './messages'
import { migrateAll } from './migrateAll'
import { occupations } from './occupations'
import { posts } from './posts'
import { postViews } from './postViews'
import { profile } from './profile'
import { profileSettings } from './profileSettings'
import { profileViews } from './profileViews'
import { references } from './references'
import { removeInvalidProfileIds } from './removeInvalidProfileIds'
import { updateProfileHandles } from './updateProfileHandles'
import { updateConversationsIds } from './updateConversationsIds'

const fixCloudfront = async () => {
  const mediaCursor = models.Media.find({}).cursor()

  let index = 0
  for await (const media of mediaCursor) {
    if (media.originalUrl.startsWith('api.shabbat.com')) {
      media.originalUrl = `https://${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}/${media.s3Key}`
    }
    media.thumbnails.forEach((thumbnail) => {
      if (thumbnail.url.startsWith('api.shabbat.com')) {
        thumbnail.url = `https://${process.env.AWS_CLOUDFRONT_DOMAIN_NAME}/${thumbnail.s3Key}`
      }
    })
    await media.save()
    index++
    console.log(`${index} media processed: ${media._id}`)
  }
}

export const runMigrate = async () => {
  const { DELETE_ALL, MIGRATE, EXCLUDE_INVALID_PROFILES } = process.env
  if (DELETE_ALL === 'true') await deleteAll()

  const startTime = new Date()
  console.info({
    event: 'MIGRATE',
    message: `Starting to migrate ${MIGRATE} at ${startTime.toISOString()}`,
  })

  if (
    [
      'all',
      'bulkConversations',
      'bulkEndorsements',
      'bulkFriendships',
      'bulkHostings',
      'bulkMessages',
      'bulkPosts',
      'bulkProfiles',
      'bulkProfileViews',
      'bulkReferences',
      'conversations',
      'endorsements',
      'friendships',
      'fullProfile',
      'hostings',
      'messages',
      'posts',
      'profile',
      'profileViews',
      'references',
      'missingFullProfiles',
      'missingProfiles',
      'removeInvalidProfileIds',
    ].includes(MIGRATE) &&
    EXCLUDE_INVALID_PROFILES !== 'false'
  ) {
    await getValidProfileIds()
  }

  if (MIGRATE === 'all') await migrateAll()
  else if (MIGRATE === 'differential') await differentialMigrate()
  else if (MIGRATE === 'bulkConversations') await bulkConversations()
  else if (MIGRATE === 'bulkEndorsements') await bulkEndorsements()
  else if (MIGRATE === 'bulkFriendships') await bulkFriendships()
  else if (MIGRATE === 'bulkHostings') await bulkHostings()
  else if (MIGRATE === 'bulkMessages') await bulkMessages()
  else if (MIGRATE === 'bulkPosts') await bulkPosts()
  else if (MIGRATE === 'bulkPostViews') await bulkPostViews()
  else if (MIGRATE === 'bulkPostViewsCount') await bulkPostViewsCount()
  else if (MIGRATE === 'bulkProfiles') await bulkProfiles()
  else if (MIGRATE === 'bulkProfileSettings') await bulkProfileSettings()
  else if (MIGRATE === 'bulkProfileViews') await bulkProfileViews()
  else if (MIGRATE === 'bulkReferences') await bulkReferences()
  else if (MIGRATE === 'conversations') await conversations()
  else if (MIGRATE === 'defaultMedia') await defaultMedia()
  else if (MIGRATE === 'endorsements') await endorsements()
  else if (MIGRATE === 'friendships') await friendships()
  else if (MIGRATE === 'fullProfile') await fullProfile()
  else if (MIGRATE === 'hostingDates') await hostingDates()
  else if (MIGRATE === 'hostings') await hostings()
  else if (MIGRATE === 'messages') await messages()
  else if (MIGRATE === 'occupations') await occupations()
  else if (MIGRATE === 'posts') await posts()
  else if (MIGRATE === 'postViews') await postViews()
  else if (MIGRATE === 'profile') await profile()
  else if (MIGRATE === 'profileSettings') await profileSettings()
  else if (MIGRATE === 'profileViews') await profileViews()
  else if (MIGRATE === 'references') await references()
  else if (MIGRATE === 'missingFullProfiles') await missingFullProfiles()
  else if (MIGRATE === 'missingProfiles') await missingProfiles()
  else if (MIGRATE === 'removeInvalidProfileIds') {
    await removeInvalidProfileIds()
  } else if (MIGRATE === 'updateProfileHandles') {
    await updateProfileHandles()
  } else if (MIGRATE === 'updateConversationsIds') {
    await updateConversationsIds()
  } else if (MIGRATE === 'fixCloudfront') {
    await fixCloudfront()
  }

  const endTime = new Date()
  const duration = endTime.getTime() - startTime.getTime()

  console.info({
    event: 'MIGRATE',
    message: `Completed to migrate ${MIGRATE} at ${endTime.toISOString()} in ${duration}ms`,
  })
}
