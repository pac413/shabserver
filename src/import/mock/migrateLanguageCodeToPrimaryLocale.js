import models from 'Models'
import { SupportedLocales } from 'Models/profile/enums'

// Migrate `languageCode` field of `profileSettings` collection
// to `primaryLocale` of `profile` collection.
export const migrateLanguageCodeToPrimaryLocale = async () => {
  const settingsCursor = models.ProfileSettings.find({
    languageCode: { $ne: 'en', $exists: true },
  }).cursor()
  const allowedLocales = Object.values(SupportedLocales)

  let index = 0
  for await (const profileSettings of settingsCursor) {
    let primaryLocale = 'en'
    index++

    if (
      profileSettings &&
      profileSettings.languageCode &&
      allowedLocales.includes(profileSettings.languageCode)
    ) {
      primaryLocale = profileSettings.languageCode
      console.log(
        `${index}: Updating ${profileSettings.profile} primaryLocale to ${primaryLocale}`
      )
    } else {
      primaryLocale = 'en'
      console.log(
        `${index}: Using default en for ${profileSettings.profile} primaryLocale`
      )
    }
    await models.Profile.updateOne(
      { _id: profileSettings.profile },
      { primaryLocale }
    )
  }
}
