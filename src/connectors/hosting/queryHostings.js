import models from 'Models'
import { HostingType } from 'Models/hosting/enums'
import getGuestListVisibility from './getGuestListVisibility'

export default async function queryHostings(input, context) {
  const { date, parts, role, statuses, types, profileId, limit } = input
  const { activeProfileId } = context
  const offset = input.offset || 0

  if (role === 'host') {
    const guestListVisibility = await getGuestListVisibility(
      profileId || activeProfileId,
      context
    )
    if (!guestListVisibility.visible) {
      return {
        hostings: [],
        total: 0,
        offset,
        limit,
      }
    }
  }

  const filter = {
    [role]: profileId || activeProfileId,
    date,
    ...(statuses ? { status: { $in: statuses } } : {}),
    ...(parts
      ? {
          $or: [
            { hostParts: { $in: parts }, type: HostingType.INVITATION },
            { guestParts: { $in: parts }, type: HostingType.REQUEST },
          ],
        }
      : {}),
    ...(types ? { type: { $in: types } } : {}),
  }

  if (limit) {
    const [hostings, total] = await Promise.all([
      models.Hosting.find(filter).skip(offset).limit(limit),
      models.Hosting.countDocuments(filter),
    ])
    return {
      hostings,
      total,
      offset,
      limit,
    }
  }
  const [hostings, total] = await Promise.all([
    models.Hosting.find(filter).skip(offset),
    models.Hosting.countDocuments(filter),
  ])

  return {
    hostings,
    total,
    offset,
    limit,
  }
}
