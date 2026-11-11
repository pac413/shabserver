import { Cache } from 'Services/cache/cache'

/**
 * Returns whether we cached before or not
 *
 * @param {string} key cache key
 *
 * @returns {Promise<boolean>} true if cached before, false if not
 */
export async function hasCached(key) {
  const count = await Cache.scard(key)
  return count > 0
}
