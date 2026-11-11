import DataLoader from 'dataloader'
import models from 'Models'
import { sanitizeDocument } from 'Utils'

export const createGuestProfileLoader = () => {
  return new DataLoader(async (profileIds) => {
    const guestProfiles = await models.GuestProfile.find({
      profile: { $in: profileIds },
    }).lean()
    return profileIds.map((pid) =>
      sanitizeDocument(guestProfiles.find((gp) => pid === gp.profile))
    )
  })
}

const guestProfileLoader = createGuestProfileLoader()

export default guestProfileLoader
