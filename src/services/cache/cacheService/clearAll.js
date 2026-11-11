import { Cache } from 'Services/cache/cache'

/**
 * Clear cache for key
 *
 * @param {string} key cache key
 */
export async function clearAll(key) {
  await Cache.del(key)
}
