import DataLoader from 'dataloader'
import models from 'Models'

// if we add a conversation when creating a hosting the loader is not needed
export const createIsMyGuestLoader = (profileId) => {
  if (!profileId) {
    return null
  }
  return new DataLoader(async (ids) => {
    const guests = await models.Hosting.aggregate([
      {
        $match: {
          host: profileId,
          guest: {
            $in: ids,
          },
        },
      },
      {
        $group: { _id: { guest: '$guest' } },
      },
      {
        $replaceWith: {
          profile: '$_id.guest',
        },
      },
    ])
    return ids.map((id) => {
      return guests.find((f) => f.profile === id) !== undefined
    })
  })
}
