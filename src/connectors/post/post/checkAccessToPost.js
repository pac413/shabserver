import { UserInputError } from 'apollo-server-errors'
import { isBlocked, isBlocking } from 'Connectors/blocking'
import followingCache from 'Connectors/follower/cache/followingCache'
import friendCache from 'Connectors/friends/cache/friendCache'
import { ERRORS_BY_CODE } from 'Errors'
import { PostPrivacySetting } from 'Models/profileSettings/enums'
import { Roles } from 'Utils/globals'

/**
 * Checks if active profile has access to post or not.
 **/
async function hasAccessToPost(post, { activeProfileId, role }) {
  const {
    excludedFromFeedByAdmin,
    isHiddenOrFlagged,
    privacySetting,
    postedBy,
  } = post

  if (postedBy === activeProfileId || role === Roles.Admin) return true
  if (excludedFromFeedByAdmin) return false
  if (isHiddenOrFlagged) return false

  const [isBlockedByPostedBy, isBlockingPostedBy] = await Promise.all([
    isBlocked(activeProfileId, postedBy),
    isBlocking(activeProfileId, postedBy),
  ])
  if (isBlockedByPostedBy || isBlockingPostedBy) {
    return false
  }

  // PostPrivacySetting = ALL
  // Anyone can see this Post.
  if (privacySetting === PostPrivacySetting.ALL) {
    return true
  }

  // PostPrivacySetting = CONNECTIONS
  // Anyone who is following this Post owner Or friend of this Post owner can see this Post.
  if (privacySetting === PostPrivacySetting.CONNECTIONS) {
    const [isFollowing, isFriend] = await Promise.all([
      followingCache.isOneExisting(activeProfileId, postedBy),
      friendCache.isOneExisting(activeProfileId, postedBy),
    ])
    return isFollowing || isFriend
  }

  // PostPrivacySetting = FRIENDS
  // Anyone who is a friend of this Post owner can see this Post.
  if (privacySetting === PostPrivacySetting.FRIENDS) {
    const isFriend = await friendCache.isOneExisting(activeProfileId, postedBy)
    return isFriend
  }

  return false
}

export async function checkAccessToPost(post, context) {
  if (!post) {
    throw new UserInputError(ERRORS_BY_CODE.INVALID_POST_ID)
  }

  const hasAccess = await hasAccessToPost(post, context)

  const { activeProfileId } = context
  if (!hasAccess) {
    console.error(
      `${activeProfileId} has tried to get forbidden post: ${post._id}`
    )
  }

  return hasAccess
}
