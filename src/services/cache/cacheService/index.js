import { cacheMany } from './cacheMany'
import { cacheOne } from './cacheOne'
import { clearAll } from './clearAll'
import { clearOne } from './clearOne'
import { getAll } from './getAll'
import { getCount } from './getCount'
import { hasCached } from './hasCached'
import { isOneExisting } from './isOneExisting'

const DEFAULT_CACHE_EXPIRE_SECONDS = 3600 // 1 hour
const defaultOptions = {
  EXPIRE_SECONDS: DEFAULT_CACHE_EXPIRE_SECONDS,
}

/**
 * Creates a new cache service
 *
 * @param {CacheOptions} customOptions options for cache settings
 
 * @typedef {object} CacheOptions
 * @property {string} EMPTY_VALUE String value to add as a cache value when empty array to cache
 * @property {number} EXPIRE_SECONDS Seconds to expire this cache key-values
 * @property {function} cacheKey Function to get cache key from parameter
 *
 * @returns {object} cache service
 */
export const initializeCacheService = (customOptions) => {
  const { cacheKey, ...otherOptions } = customOptions
  const getCacheKey = typeof cacheKey === 'function' ? cacheKey : (key) => key
  const options = {
    ...defaultOptions,
    ...otherOptions,
  }
  return {
    cacheMany: (key, values) => cacheMany(options, getCacheKey(key), values),
    cacheOne: (key, value) => cacheOne(options, getCacheKey(key), value),
    clearAll: (key) => clearAll(getCacheKey(key)),
    clearOne: (key, value) => clearOne(getCacheKey(key), value),
    getAll: (key) => getAll(options, getCacheKey(key)),
    getCount: (key) => getCount(options, getCacheKey(key)),
    hasCached: (key) => hasCached(getCacheKey(key)),
    isOneExisting: (key, value) => isOneExisting(getCacheKey(key), value),
  }
}
