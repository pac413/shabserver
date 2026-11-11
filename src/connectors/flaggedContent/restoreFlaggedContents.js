import models from 'Models'
import { flagResource } from './flagContent'

export default async function restoreFlaggedContents(profileId) {
  const whereOptions = {
    $or: [{ reportedBy: profileId }, { ownedBy: profileId }],
  }
  await models.FlaggedContent.restore(whereOptions).exec()

  const flaggedContents = await models.FlaggedContent.find(whereOptions)

  for (const flaggedContent of flaggedContents) {
    try {
      await flagResource(flaggedContent.toObject())
    } catch (err) {
      await flaggedContent.delete()
      throw err
    }
  }
}
