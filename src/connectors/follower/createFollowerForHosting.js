import { FollowerType } from 'Models/follower/enums'
import { upsertFollower } from './upsertFollower'

export async function createFollowerForHosting(hosting) {
  const { host, guest } = hosting

  return Promise.all([
    upsertFollower(host, guest, FollowerType.HOSTING),
    upsertFollower(guest, host, FollowerType.HOSTING),
  ])
}
