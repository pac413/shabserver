import { Cache } from 'Services/cache/cache'

/**
 * Returns cached value count
 *
 * @param {string} key cache key
 *
 * @returns {Promise<number>} Number of cached values
 */
export async function getCount(options, key) {
  const count = await Cache.scard(key)
  if (count > 1) {
    return count
  }

  if (count === 1) {
    const { EMPTY_VALUE } = options
    const existing = await Cache.sismember(key, EMPTY_VALUE)
    return existing ? 0 : 1
  }

  return -1
}
