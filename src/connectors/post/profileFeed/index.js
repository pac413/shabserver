import { getPostsByProfile } from './getPostsByProfile'

/**
 * Get paginated profile feed by profileId --- This is for admin only
 * @param {*} input InputPayload - { profileId, limit, offset }
 * @param {*} context Context - { activeProfileId }
 */
export const getAdminProfileFeed = getPostsByProfile
export * from './user'
