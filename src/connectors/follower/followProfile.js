import models from 'Models'
import { FollowerType } from 'Models/follower/enums'
import { NotificationType, NotificationStatus } from 'Models/notification/enums'
import { createNewNotification } from 'Connectors/notification'
import { getProfileUrl } from 'Utils/profile'
import { upsertFollower } from './upsertFollower'
import followerCache from './cache/followerCache'
import followingCache from './cache/followingCache'

export async function followProfile({ profileId }, context) {
  const { activeProfileId } = context
  const { existing } = await upsertFollower(
    profileId,
    activeProfileId,
    FollowerType.FOLLOWER
  )

  // If you add a new follower, you need to populate feed for that follower
  if (existing) {
    return true
  }

  await Promise.all([
    followerCache.cacheOne(profileId, activeProfileId),
    followingCache.cacheOne(activeProfileId, profileId),
  ])

  await createNewFollowingNotification(profileId, activeProfileId)
  return true
}

const createNewFollowingNotification = async (profileId, activeProfileId) => {
  const activeProfile = await models.Profile.findById(activeProfileId).lean()

  await createNewNotification({
    profile: profileId,
    triggeredBy: activeProfileId,
    type: NotificationType.PROFILE_FOLLOW,
    title: { name: 'notification.profile-followed.title' },
    content: {
      name: 'notification.profile-followed.content',
      variables: {
        profileUrl: getProfileUrl(activeProfile),
        firstName: activeProfile.firstName,
        lastName: activeProfile.lastName,
      },
    },
    status: NotificationStatus.NEW,
  })
}
