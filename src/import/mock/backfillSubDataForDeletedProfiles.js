/**
 * One-time usage backfiller
 * Remove all sub-data for deleted / suspended profiles
 */
import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'
import { deleteSubDataForProfile } from 'Connectors/user/helpers/deleteSubDataForProfile'

const args = process.argv.slice(2)
const batchSize = parseInt(args[0], 10)
const page = parseInt(args[1], 10) || 0

export const backfillSubDataForDeletedProfiles = async () => {
  console.log('Backfilling sub-data for the deleted / suspended profiles...')

  const deletedProfiles = await models.Profile.find({
    accountStatus: {
      $in: [ProfileStatuses.DELETED, ProfileStatuses.ADMIN_SUSPENDED],
    },
  })
    .sort({ createdAt: 1 })
    .limit(batchSize)
    .skip(page * batchSize)

  let success = 0
  let failure = 0
  for (const profile of deletedProfiles) {
    const shouldHardDelete =
      profile.accountStatus === ProfileStatuses.ADMIN_SUSPENDED
    const logPrefix = `${
      shouldHardDelete ? 'Hard' : 'Soft'
    }-deleting sub-data for the profile: ${profile._id}`

    try {
      await deleteSubDataForProfile(profile._id, shouldHardDelete)
      // Hard-delete refreshToken
      await models.RefreshToken.deleteMany({ user: profile.user })

      success += 1
      console.log(`*** ${logPrefix} is succeeded ***`)
    } catch (error) {
      failure += 1
      console.log(`### ${logPrefix} is failed ###`, error)
    }
  }

  console.log(
    `Total: ${deletedProfiles.length}, Success: ${success}, Failure: ${failure}`
  )
}
