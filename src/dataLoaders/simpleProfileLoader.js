import DataLoader from 'dataloader'
import models from 'Models'
import { sanitizeDocument } from 'Utils'

export const simpleProfileSelector = {
  _id: 1,
  avatar: 1,
  firstName: 1,
  lastName: 1,
  displayName: 1,
  email: 1,
  phone: 1,
  handle: 1,
  location: 1,
  occupation: 1,
  primaryLocale: 1,
  siteRoles: 1,
  uncuratedOccupation: 1,
  about: 1,
}

export const createSimpleProfileLoader = () => {
  return new DataLoader(async (ids) => {
    const profiles = await models.Profile.find({ _id: { $in: ids } })
      .select(simpleProfileSelector)
      .lean()
    return ids.map((id) => sanitizeDocument(profiles.find((p) => id === p._id)))
  })
}

const simpleProfileLoader = createSimpleProfileLoader()
export default simpleProfileLoader
