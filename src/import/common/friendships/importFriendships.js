import faker from 'faker'
import { flatten } from 'lodash'
import moment from 'moment'
import { v4 as uuid } from 'uuid'
import { parseMigratedDate } from 'Import/common/helpers'
import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'
import { FriendshipStatus } from 'Models/friendship/enums'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const isValidData = (data) => {
  return (
    data.members.every((member) => validProfileIds.includes(member)) &&
    validProfileIds.includes(data.requester)
  )
}

const populateFieldsFromData = (data, profileId, importedAt) => {
  if (IS_MOCK_IMPORT) {
    const currentStatus = faker.random.arrayElement(
      Object.values(FriendshipStatus)
    )
    return {
      members: data.members,
      requester: profileId,
      currentStatus,
      statusHistory: [{ status: currentStatus, date: moment.utc().toDate() }],
      importedAt,
    }
  }

  const createdAt = parseMigratedDate(data.createdAt) || importedAt
  const updatedAt = parseMigratedDate(data.updatedAt) || importedAt
  return {
    _id: uuid(),
    members: data.members,
    requester: data.requester,
    currentStatus: data.currentStatus,
    statusHistory: data.statusHistory.map((status, index) => ({
      status,
      date: index === 0 ? new Date(createdAt) : new Date(updatedAt),
    })),
    createdAt,
    updatedAt,
    importedAt,
  }
}

export const importFriendships = async (friendships, profileId, importedAt) => {
  const validFriendships = friendships.filter((friendship) =>
    isValidData(friendship)
  )
  console.log({
    event: 'IMPORT_FRIENDSHIPS',
    message: `Importing ${validFriendships.length}/${friendships.length} valid friendships for ${profileId}`,
    profileId,
  })

  await models.Friendship.bulkWrite(
    flatten(
      validFriendships.map((data) => {
        const fields = populateFieldsFromData(data, profileId, importedAt)
        return [
          {
            deleteOne: {
              filter: {
                members: fields.members,
                requester: fields.requester,
              },
            },
          },
          {
            insertOne: {
              document: fields,
              timestamps: false,
            },
          },
        ]
      })
    )
  )
}
