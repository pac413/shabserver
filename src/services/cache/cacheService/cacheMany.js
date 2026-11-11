import { Cache } from 'Services/cache/cache'
import { clearAll } from './clearAll'

/**
 * Cache many key-value pairs for one key
 *
 * @param {object} options options for cache settings
 * @param {string} key key
 * @param {[string]} values list of values to cache for this key
 *
 * @returns {Promise<[string]>} cached values
 */
export async function cacheMany(options, key, values) {
  const { EMPTY_VALUE, EXPIRE_SECONDS } = options
  await clearAll(key)

  if (values.length === 0) {
    // If there is only one value which is `EMPTY_VALUE`,
    // it means empty.
    // Instead of adding nothing to the cache,
    // we add this `constant` value to know
    await Cache.sadd(key, EMPTY_VALUE)
  } else {
    await Cache.sadd(key, ...values)
  }

  await Cache.expire(key, EXPIRE_SECONDS)

  return values
}
