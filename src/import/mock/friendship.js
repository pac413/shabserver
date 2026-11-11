import Promise from 'bluebird'
import faker from 'faker'
import moment from 'moment'
import { importFriendships } from 'Import/common/friendships/importFriendships'
import { randomProfileId } from 'Import/mock/fake'
import models from 'Models'

const importFakeFriendships = async (profile, existingProfilesIds) => {
  const importedAt = moment.utc().toDate()
  const friendshipsCount = faker.random.arrayElement([
    0, 0, 0, 1, 1, 5, 5, 5, 5, 5, 20, 30,
  ])
  console.log(`faking ${friendshipsCount} friendships for ${profile._id}`)

  const fakedFriendships = []
  for (let i = 0; i < friendshipsCount; i++) {
    const newFriend = randomProfileId(existingProfilesIds, [profile._id])
    const existingFriend = await models.Friendship.find({
      $and: [{ members: profile._id }, { members: newFriend }],
    })

    if (existingFriend[0]) {
      console.log(`skipping ${profile._id} and ${newFriend}`)
      continue
    }

    fakedFriendships.push({ members: [profile._id, newFriend] })
  }

  return importFriendships(fakedFriendships, profile._id, importedAt)
}

export const runFriendshipsImport = async () => {
  const importedAt = moment.utc().toDate()
  const profiles = await models.Profile.find({}).lean()
  const existingProfilesIds = profiles.map((p) => p._id)
  console.log(`faking friendships for ${profiles.length} profiles`)
  await Promise.map(
    profiles,
    (profile) =>
      importFakeFriendships(profile, existingProfilesIds, importedAt),
    {
      concurrency: 1,
    }
  )
  console.log('faked friendships')
}
