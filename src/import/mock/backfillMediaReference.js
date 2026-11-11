/**
 * One-time usage backfiller
 * Fix messed-ups in the media reference that `postId` doesn't exist when `feedItemId` (old concept) exists
 */
import models from 'Models'

export const backfillMediaReference = async () => {
  console.log('Backfilling reference for the existing media documents...')

  const mediaArrayToBackfill = await models.Media.find({
    'reference.feedItemId': { $exists: true, $ne: null },
  })
  let success = 0
  let failure = 0

  for (const media of mediaArrayToBackfill) {
    try {
      media.reference = {
        ...media.reference,
        postId: media.reference.feedItemId,
      }
      await media.save()
      success += 1
      console.log(`Successfully backfilled a media: ${media._id}`)
    } catch (error) {
      failure += 1
      console.log(`Failed to backfill a media: ${media._id}`, error)
    }
  }

  console.log(
    `Total: ${mediaArrayToBackfill.length}, Success: ${success}, Failure: ${failure}`
  )
}
