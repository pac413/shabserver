import { Cache } from 'Services/cache/cache'

/**
 * Returns if key-value pair exists in the cache or not
 *
 * @param {string} key cache key
 * @param {string} value cache value
 *
 * @returns {Promise<boolean>} true if exists, false if not
 */
export async function isOneExisting(key, value) {
  const existing = await Cache.sismember(key, value)
  return existing
}
