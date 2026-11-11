import faker from 'faker'

export const randomProfileId = (existingProfilesIds, exclude = []) => {
  return faker.random.arrayElement(
    existingProfilesIds.filter((p) => !exclude.includes(p))
  )
}
