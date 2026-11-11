import models from 'Models'

/**
 * Check if input medias are using the same original media
 * @param {string[]} mediaIds
 * @returns {boolean}
 */
export default async function compareOriginalMedia(mediaIds) {
  if (!mediaIds.length) {
    return true
  }
  const medias = await Promise.all(
    mediaIds.map((mediaId) => models.Media.findById(mediaId))
  )
  const { originalMediaId: targetOriginalMediaId } = medias[0].reference || {}
  for (const media of medias) {
    const { originalMediaId } = media.reference || {}
    if (targetOriginalMediaId !== originalMediaId) {
      return false
    }
  }
  if (!targetOriginalMediaId) {
    return false
  }
  return true
}
