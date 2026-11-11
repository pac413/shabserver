import { Cache } from 'Services/cache/cache'
import { clearAll } from './clearAll'
import { hasEmptyCache } from './utils'

/**
 * Cache one key-value pair
 *
 * @param {CacheOptions} options options for cache settings
 * @param {string} key cache key
 * @param {string} value cache value
 *
 * @typedef {object} CacheOptions
 * @property {string} EMPTY_VALUE String value to add as a cache value when empty array to cache
 * @property {number} EXPIRE_SECONDS Seconds to expire this cache key-values
 *
 * @returns {Promise<boolean>} true if it has been cached, false if it needs full-refresh
 */
export async function cacheOne(options, key, value) {
  const { EXPIRE_SECONDS } = options
  const existingValues = await Cache.smembers(key)
  if (existingValues.length === 0) {
    return false
  }

  if (hasEmptyCache(options, existingValues)) {
    await clearAll(key)
  }

  await Cache.sadd(key, value)
  await Cache.expire(key, EXPIRE_SECONDS)

  return true
}
