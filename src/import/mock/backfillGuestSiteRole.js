/**
 * One-time usage backfiller
 * Backfill all profiles who don't have guest site role to have guest site role with `available` guest preference
 */
import models from 'Models'
import { SiteRoles } from 'Models/profile/enums'
import { updateProfileAvailability } from 'Connectors/profile'

export const backfillGuestSiteRole = async () => {
  console.log('Backfilling profiles to have guest site role')

  // STEP 1: Query all profiles who don't have `guest` site role
  const profilesToBackfill = await models.Profile.find({
    siteRoles: { $ne: SiteRoles.GUEST },
  })

  // STEP 2: Create / Restore guest profiles for profilesToBackfill
  let success = 0
  let failure = 0
  let skip = 0
  for (const profile of profilesToBackfill) {
    try {
      const deletedGuestProfiles = await models.GuestProfile.findDeleted({
        profile: profile._id,
      })
      if (deletedGuestProfiles.length) {
        skip += 1
        console.log(`Skipped backfilling a profile: ${profile._id}`)
      } else {
        // STEP 2.1: Create guest profile
        await models.GuestProfile.create({ profile: profile._id })

        // STEP 2.2: Add guest role to the profile
        profile.siteRoles.push(SiteRoles.GUEST)
        await profile.save()

        // STEP 2.3: Update profile's availableOnly
        await updateProfileAvailability(profile._id)

        success += 1
        console.log(`Successfully backfilled a profile: ${profile._id}`)
      }
    } catch (error) {
      failure += 1
      console.log(`Failed to backfill a profile: ${profile._id}`, error)
    }
  }

  console.log(
    `Total: ${profilesToBackfill.length}, Success: ${success}, Skip: ${skip}, Failure: ${failure}`
  )
}
