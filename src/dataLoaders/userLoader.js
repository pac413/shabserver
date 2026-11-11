import DataLoader from 'dataloader'
import models from 'Models'
import { sanitizeDocument } from 'Utils'

export const createUserLoader = () => {
  return new DataLoader(async (ids) => {
    const users = await models.User.find({
      _id: { $in: ids },
    }).lean()
    return ids.map((id) => sanitizeDocument(users.find((u) => id === u._id)))
  })
}

const userLoader = createUserLoader()
export default userLoader
