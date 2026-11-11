import { uniq } from 'lodash'
import getBlockeds from './getBlockeds'
import getBlockings from './getBlockings'

export default async function getActionBlockingProfileIds(profileId) {
  const [blockeds, blockings] = await Promise.all([
    getBlockeds(profileId),
    getBlockings(profileId),
  ])

  return uniq([...blockeds, ...blockings])
}
