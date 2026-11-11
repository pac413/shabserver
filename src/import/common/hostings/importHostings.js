import faker from 'faker'
import { flatten } from 'lodash'
import { v4 as uuid } from 'uuid'
import { parseMigratedDate } from 'Import/common/helpers'
import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'
import { HostingPart, HostingStatus, HostingType } from 'Models/hosting/enums'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const isValidData = (data) => {
  return (
    validProfileIds.includes(data.host) && validProfileIds.includes(data.guest)
  )
}

const populateFieldsFromData = (data, profileId, importedAt) => {
  if (IS_MOCK_IMPORT) {
    const type = faker.random.arrayElement(Object.values(HostingType))
    const status = faker.random.arrayElement(Object.values(HostingStatus))
    const parts = [HostingPart.NIGHT, HostingPart.DAY]
    return {
      host: data.host,
      guest: data.guest,
      type,
      status,
      date: data.date,
      guestParts: type === HostingType.REQUEST ? parts : [],
      hostParts: type === HostingType.INVITATION ? parts : [],
      statusHistory: [],
      importedAt,
    }
  }

  return {
    _id: uuid(),
    host: data.host,
    guest: data.guest,
    type: data.type,
    status: data.status,
    date: parseMigratedDate(data.date),
    guestParts: data.guestParts,
    hostParts: data.hostParts,
    statusHistory: data.statusHistory,
    createdAt: parseMigratedDate(data.createdAt) || importedAt,
    updatedAt: parseMigratedDate(data.updatedAt) || importedAt,
    importedAt,
  }
}

export const importHostings = async (hostings, profileId, importedAt) => {
  const validHostings = hostings.filter((hosting) => isValidData(hosting))
  console.log({
    event: 'IMPORT_HOSTINGS',
    message: `Importing ${validHostings.length}/${hostings.length} hostings for ${profileId}`,
    profileId,
  })

  await models.Hosting.bulkWrite(
    flatten(
      validHostings.map((data) => {
        const fields = populateFieldsFromData(data, profileId, importedAt)
        return [
          {
            deleteOne: {
              filter: {
                host: fields.host,
                guest: fields.guest,
                date: fields.date,
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
