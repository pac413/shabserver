import models from 'Models'
import Promise from 'bluebird'

export const importOccupations = async () => {
  const occupations = require('Import/common/data/occupations.json')
  console.log({
    event: 'IMPORT_OCCUPATIONS',
    message: 'Starting to import all occupations',
    occupations,
  })
  await models.Occupation.deleteMany()
  await Promise.map(occupations, (occupation) => {
    return models.Occupation.create({
      name: occupation.name,
      lang: occupation.lang,
      occupationId: occupation.occupationId,
    })
  })
  console.log({
    event: 'OCCUPATION',
    message: 'Completed to import all occupations',
  })
}
