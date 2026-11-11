import { Cache } from 'Services/cache/cache'
import { hasEmptyCache } from './utils'

/**
 * Returns all the cached values by key
 *
 * @param {CacheOptions} options options for cache settings
 * @param {string} key cache key
 *
 * @typedef {object} CacheOptions
 * @property {string} EMPTY_VALUE String value to add as a cache value when empty array to cache
 * @property {number} EXPIRE_SECONDS Seconds to expire this cache key-values
 *
 * @returns {Promise<[string]>} cached values
 */
export async function getAll(options, key) {
  const values = await Cache.smembers(key)
  if (hasEmptyCache(options, values)) {
    return []
  }

  return values
}
