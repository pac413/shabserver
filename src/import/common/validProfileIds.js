import models from 'Models'

export const validProfileIds = []

export const getValidProfileIds = async () => {
  if (validProfileIds.length > 0) {
    return validProfileIds
  }
  const profiles = await models.Profile.find()
    .sort({ createdAt: 1 })
    .select({ _id: 1 })
    .lean()

  validProfileIds.push(...profiles.map(({ _id }) => _id))
  return validProfileIds
}
