import { PostType } from 'Models/post/enums'

/**
 * Calculates `eligibleForGeneralFeed` of post collection
 * This field is used in general feed query
 */
export function getEligibleForGeneralFeed(post) {
  const { hasMedia, webScraped, type } = post

  return hasMedia || !!webScraped || type === PostType.BIRTHDAY_TODAY
}
