import DataLoader from 'dataloader'
import models from 'Models'

export const createMediaLoader = () => {
  return new DataLoader(async (ids) => {
    const media = await models.Media.find({
      _id: { $in: ids },
    }).lean()
    return ids.map((id) => media.find((m) => id === m._id))
  })
}

const mediaLoader = createMediaLoader()
export default mediaLoader
