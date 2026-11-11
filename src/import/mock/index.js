import { deleteAll } from 'Import/common/deleteAll'
import { importHostingDates } from 'Import/common/hostingDate/importHostingDates'
import { importOccupations } from 'Import/common/occupations/importOccupations'
import models from 'Models'
import { addEligibleForGeneralFeed } from './addEligibleForGeneralFeed'
import { addIsHiddenOrFlagged } from './addIsHiddenOrFlagged'
import { addIsHiddenOrFlaggedComment } from './addIsHiddenOrFlaggedComment'
import { runEndorsementsImport } from './endorsement'
import { runFeatureImport } from './feature'
import { runFriendshipsImport } from './friendship'
import { runHostingImport } from './hosting'
import { runMediaImport } from './media'
import { runMessageImport } from './message'
import { migrateLanguageCodeToPrimaryLocale } from './migrateLanguageCodeToPrimaryLocale'
import { runProfileViewsImport } from './profileView'
import { runPostImport } from './post'
import { runProfileImport } from './profile'
import { runProfileSettingsImport } from './profileSettings'
import { backfillMediaReference } from './backfillMediaReference'
import { backfillSubDataForDeletedProfiles } from './backfillSubDataForDeletedProfiles'
import { backfillOggVideos } from './backfillOggVideos'
import { backfillVideoOrientation } from './backfillVideoOrientation'
import { runOcrEngine } from './runOcrEngine'
import { refineOcrResult } from './refineOcrResult'
import { updateFeedRestrictions } from './updateFeedRestrictions'
import { backfillGuestSiteRole } from './backfillGuestSiteRole'

const importProfiles = async () => {
  const offset = Number(process.env.OFFSET || 0)
  if (offset === 0) {
    await deleteAll()
    await importOccupations()
  }

  await runProfileImport()
}

export const runMockImport = async () => {
  console.info(`Running import ${process.env.IMPORT}`)
  switch (process.env.IMPORT) {
    case 'profiles':
      await importProfiles()
      break
    case 'profileViews':
      await runProfileViewsImport()
      break
    case 'endorsements':
      await runEndorsementsImport()
      break
    case 'friendships':
      console.log('deleting existing friendships...')
      await models.Friendship.deleteMany({})
      await runFriendshipsImport()
      break
    case 'hostings':
      await runHostingImport()
      break
    case 'posts':
      await runPostImport()
      break
    case 'dates':
      await importHostingDates()
      break
    case 'messages':
      await runMessageImport()
      break
    case 'features':
      await runFeatureImport()
      break
    case 'profileSettings':
      await runProfileSettingsImport()
      break
    case 'media':
      await runMediaImport()
      break
    case 'backfillMediaReference':
      await backfillMediaReference()
      break
    case 'backfillSubDataForDeletedProfiles':
      await backfillSubDataForDeletedProfiles()
      break
    case 'migrateLanguageCodeToPrimaryLocale':
      await migrateLanguageCodeToPrimaryLocale()
      break
    case 'addEligibleForGeneralFeed':
      await addEligibleForGeneralFeed()
      break
    case 'addIsHiddenOrFlagged':
      await addIsHiddenOrFlagged()
      break
    case 'addIsHiddenOrFlaggedComment':
      await addIsHiddenOrFlaggedComment()
      break
    case 'updateFeedRestrictions':
      await updateFeedRestrictions()
      break
    case 'backfillOggVideos':
      await backfillOggVideos()
      break
    case 'backfillVideoOrientation':
      await backfillVideoOrientation()
      break
    case 'runOcrEngine':
      await runOcrEngine()
      break
    case 'refineOcrResult':
      await refineOcrResult()
      break
    case 'backfillGuestSiteRole':
      await backfillGuestSiteRole()
      break
    case 'all':
      await importProfiles()
      await runProfileSettingsImport()
      await runFriendshipsImport()
      await Promise.all([runProfileViewsImport(), runEndorsementsImport()])
      await runMessageImport()
      await runFeatureImport()

      await importHostingDates()
      await runHostingImport()

      await runPostImport()
      break
  }

  console.info(`Import ${process.env.IMPORT} complete`)
  process.exit()
}
