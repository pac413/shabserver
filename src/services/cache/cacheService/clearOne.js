import { Cache } from 'Services/cache/cache'

/**
 * Remove single key-value from cache
 *
 * @param {string} key cache key to remove
 * @param {string} value cache value to remove
 */
export async function clearOne(key, value) {
  await Cache.srem(key, value)
}
