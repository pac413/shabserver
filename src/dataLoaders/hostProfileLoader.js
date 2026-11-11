import DataLoader from 'dataloader'
import models from 'Models'
import { sanitizeDocument } from 'Utils'

export const createHostProfileLoader = () => {
  return new DataLoader(async (profileIds) => {
    const profiles = await models.HostProfile.aggregate([
      { $match: { profile: { $in: profileIds } } },
      {
        $group: {
          _id: '$profile',
          hostProfiles: {
            $push: '$$ROOT',
          },
        },
      },
    ])
    return profileIds.map((pid) =>
      sanitizeDocument(profiles.find((p) => pid === p._id))
    )
  })
}

const hostProfileLoader = createHostProfileLoader()

export default hostProfileLoader
