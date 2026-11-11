import DataLoader from 'dataloader'
import models from 'Models'
import { sanitizeDocument } from 'Utils'

export const createProfileSettingsLoader = () => {
  return new DataLoader(async (ids) => {
    const settings = await models.ProfileSettings.find({
      profile: { $in: ids },
    }).lean()
    return ids.map((id) =>
      sanitizeDocument(settings.find((s) => id === s.profile))
    )
  })
}

const profileSettingsLoader = createProfileSettingsLoader()
export default profileSettingsLoader
