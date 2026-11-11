import { autoTypeSearchOccupations } from './autoTypeSearchOccupations'
import { autoTypeSearchProfiles } from './autoTypeSearchProfiles'

export async function autoTypeSearch(input, context) {
  const { searchBy } = input
  let profiles = []
  let occupations = []

  const promises = []
  if (['all', 'profiles'].includes(searchBy)) {
    promises.push(
      autoTypeSearchProfiles(input, context).then((data) => {
        profiles = data
      })
    )
  }
  if (['all', 'occupations'].includes(searchBy)) {
    promises.push(
      autoTypeSearchOccupations(input, context).then((data) => {
        occupations = data
      })
    )
  }

  await Promise.all(promises)

  return {
    profiles,
    occupations,
  }
}
