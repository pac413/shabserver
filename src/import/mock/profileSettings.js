import { createProfileSettings } from 'Connectors/profileSettings'
import models from 'Models'

export const runProfileSettingsImport = async () => {
  console.log('deleting existing profile settings documents...')
  await models.ProfileSettings.deleteMany({})

  const profileCursor = models.Profile.find({}).select({ _id: 1 }).cursor()

  for await (const profile of profileCursor) {
    await createProfileSettings(profile._id)
  }

  console.log('finished importing profile settings')
}
