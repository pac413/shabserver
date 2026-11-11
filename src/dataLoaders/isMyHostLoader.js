import DataLoader from 'dataloader'
import models from 'Models'

// if we add a conversation when creating a hosting the loader is not needed
export const createIsMyHostLoader = (profileId) => {
  if (!profileId) {
    return null
  }
  return new DataLoader(async (ids) => {
    const hosts = await models.Hosting.aggregate([
      {
        $match: {
          guest: profileId,
          host: {
            $in: ids,
          },
        },
      },
      {
        $group: { _id: { host: '$host' } },
      },
      {
        $replaceWith: {
          profile: '$_id.host',
        },
      },
    ])
    return ids.map((id) => {
      return hosts.find((f) => f.profile === id) !== undefined
    })
  })
}
