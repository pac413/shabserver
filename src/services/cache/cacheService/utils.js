/**
 * If there is only one value which is `NO_BLOCKING_VALUE`,
 * it means that this profile has cached empty.
 *
 * @param {CacheOptions} options options for cache settings
 * @param {[string]} values values from cache
 *
 * @typedef {object} CacheOptions
 * @property {string} EMPTY_VALUE String value to add as a cache value when empty array to cache
 * @property {number} EXPIRE_SECONDS Seconds to expire this cache key-values
 *
 * @returns cached values
 */
export const hasEmptyCache = (options, values) => {
  const { EMPTY_VALUE } = options
  return values.length === 1 && values[0] === EMPTY_VALUE
}
