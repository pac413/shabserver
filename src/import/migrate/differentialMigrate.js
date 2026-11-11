import Promise from 'bluebird'
import models from 'Models'
import { migrateSingleConversations } from './utils/conversations'
import { migrateSingleEndorsements } from './utils/endorsements'
import { migrateSingleFriendships } from './utils/friendships'
import { migrateSingleHostings } from './utils/hostings'
import { migrateSingleMessages } from './utils/messages'
import { migrateSinglePosts } from './utils/posts'
// import { migrateBulkPostViewsCount } from './utils/postViewsCount'
import { migrateBulkProfiles } from './utils/profile'
import { migrateSingleProfileSettings } from './utils/profileSettings'
import { migrateSingleProfileViews } from './utils/profileViews'
import { migrateSingleReferences } from './utils/references'
import { updateConversationsIds } from './updateConversationsIds'
import { updateProfileHandles } from './updateProfileHandles'

export const differentialMigrate = async () => {
  if (!process.env.AFTER) {
    console.error('AFTER ')
    console.error({
      event: 'DIFFERENTIAL_MIGRATE',
      message: 'AFTER field is required for differential migration',
    })
  }
  await migrateBulkProfiles()
  await updateProfileHandles()

  const profileIds = await models.Profile.find({}).select({ _id: 1 }).lean()

  await Promise.map(
    profileIds,
    async (profile, index) => {
      console.log(`${index}: Differential migration for ${profile._id} started`)
      try {
        await Promise.all([
          migrateSingleProfileSettings(profile._id),
          migrateSinglePosts(profile._id),
          migrateSingleConversations(profile._id),
          migrateSingleProfileViews(profile._id),
          migrateSingleFriendships(profile._id),
          migrateSingleEndorsements(profile._id),
          migrateSingleReferences(profile._id),
          migrateSingleHostings(profile._id),
        ])

        await Promise.all([
          // migrateBulkPostViewsCount(profile._id),
          migrateSingleMessages(profile._id),
        ])
        console.log(
          `${index}: Differential migration for ${profile._id} completed`
        )
      } catch (err) {
        console.error(
          `${index}: Differential migration for ${profile._id} failed`,
          err
        )
      }
    },
    {
      concurrency: 30,
    }
  )

  await updateConversationsIds()
}
