import { isActionBlocked } from 'Connectors/blocking'
import followingCache from 'Connectors/follower/cache/followingCache'
import friendCache from 'Connectors/friends/cache/friendCache'
import { getProfileSettings } from 'Connectors/profileSettings'
import { PostPrivacySetting } from 'Models/profileSettings/enums'
import { getPostsByProfile } from './getPostsByProfile'

async function getOtherProfileFeed(input, context) {
  const { profileId } = input
  const { activeProfileId } = context
  const profileSettings = await getProfileSettings(profileId)

  if (profileSettings.postPrivacy === PostPrivacySetting.ALL) {
    return getPostsByProfile(input, context)
  }

  if (profileSettings.postPrivacy === PostPrivacySetting.CONNECTIONS) {
    const [isFriend, isFollowing] = await Promise.all([
      friendCache.isOneExisting(activeProfileId, profileId),
      followingCache.isOneExisting(activeProfileId, profileId),
    ])

    if (isFriend || isFollowing) {
      return getPostsByProfile(input, context)
    }

    return Promise.resolve({ total: 0, posts: [] })
  }

  if (profileSettings.postPrivacy === PostPrivacySetting.FRIENDS) {
    const isFriend = await friendCache.isOneExisting(activeProfileId, profileId)

    if (isFriend) {
      return getPostsByProfile(input, context)
    }

    return Promise.resolve({ total: 0, posts: [] })
  }

  return Promise.resolve({ total: 0, posts: [] })
}

/**
 * Get paginated profile feeds
 * @param {*} input InputPayload - { profileId, limit, offset }
 * @param {*} context Context - { activeProfileId }
 */
export async function getProfileFeed(input, context) {
  const { activeProfileId } = context
  const profileId = input.profileId || activeProfileId

  // If you are fetching ProfileFeed of active profile
  if (profileId === activeProfileId) {
    return getPostsByProfile(input, context)
  }

  const actionBlocked = await isActionBlocked(activeProfileId, profileId)
  if (actionBlocked) {
    return { total: 0, posts: [] }
  }

  // If you are fetching ProfileFeed of other profile
  return getOtherProfileFeed(input, context)
}
