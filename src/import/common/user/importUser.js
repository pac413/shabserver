import { parseMigratedDate } from 'Import/common/helpers'
import models from 'Models'
import { IS_MOCK_IMPORT } from 'Utils/globals'

const populateFieldsFromData = async (data, importedAt) => {
  const hashedPassword = await models.User.generatePasswordHash(
    IS_MOCK_IMPORT ? process.env.IMPORT_PASSWORD : data.password
  )

  return {
    _id: data._id,
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    password: hashedPassword,
    isAdmin: data.isAdmin || data.roles.includes('Admin'),
    ...(data.facebook && data.facebook.id ? { facebook: data.facebook } : {}),
    createdAt: parseMigratedDate(data.dateCreated) || importedAt,
    updatedAt: parseMigratedDate(data.dateModified) || importedAt,
    importedAt,
  }
}

const findExisting = async (data) => {
  const user = await models.User.findOne({ email: data.email })
  return user
}

const create = async (data, importedAt) => {
  const fields = await populateFieldsFromData(data, importedAt)
  const user = await models.User.create(fields)
  console.log({
    event: 'USER',
    message: `Created user ${data.email}`,
    email: data.email,
  })
  return user
}

const update = async (data, user, importedAt) => {
  const lastModified = data.dateModified ? new Date(data.dateModified) : null
  const newImportedAt = new Date(user.importedAt || importedAt)

  // No need to reimport as we already have more up-to-date data
  if (lastModified && lastModified.getTime() > newImportedAt.getTime()) {
    console.log({
      event: 'USER',
      message: `Skipped user migration for ${data.email}`,
      email: data.email,
    })
    return user
  }

  const { _id, ...updates } = await populateFieldsFromData(data, importedAt)
  await models.User.updateOne({ _id }, updates)
  console.log({
    event: 'USER',
    message: `Updated user ${data.email}`,
    email: data.email,
  })
  return user
}

export const importUser = async (data, importedAt) => {
  console.log({
    event: 'IMPORT_USER',
    message: `Importing user ${data.email}`,
    data,
  })

  const existingUser = await findExisting(data)
  let user
  if (existingUser) {
    user = await update(data, existingUser, importedAt)
  } else {
    user = await create(data, importedAt)
  }

  return user
}
