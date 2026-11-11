import Promise from 'bluebird'
import moment from 'moment'
import { importProfile } from 'Import/common/profile/importProfile'

const importProfiles = async (profilesData, importedAt) => {
  return Promise.map(
    profilesData,
    async (originalData) => {
      const data = {
        ...originalData,
        wallpaper: {
          original: originalData.wallpaper,
          createdAt: moment.utc().toDate(),
          updatedAt: moment.utc().toDate(),
        },
      }
      if (data.roles.includes('Host')) {
        data.hostProfile = {}
      }
      if (data.roles.includes('Guest')) {
        data.guestProfile = {}
      }
      try {
        await importProfile(data, importedAt)
      } catch (err) {
        console.error('Failed to import profile ', err)
      }
    },
    {
      concurrency: 1,
    }
  )
}

export const runProfileImport = async (
  dataFile = './data/user-profiles.json'
) => {
  const data = require(dataFile)
  const { SiteMembers } = data
  const offset = Number(process.env.OFFSET || 0)
  const limit = Number(process.env.LIMIT || SiteMembers.length)
  const calcLimit = Number.parseInt(offset + limit)
  const importedAt = moment.utc().toDate()

  const profileSlice = SiteMembers.slice(offset, calcLimit)
  console.log(
    `importing ${profileSlice.length} from ${offset} to ${calcLimit} at ${importedAt}`
  )
  await importProfiles(profileSlice, importedAt)
  console.log('imported profile')
}
