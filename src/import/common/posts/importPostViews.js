import { v4 as uuid } from 'uuid'
import { validProfileIds } from 'Import/common/validProfileIds'
import models from 'Models'

export const importPostViews = async (post, postViews, importedAt) => {
  await models.PostView.bulkWrite(
    postViews
      .filter((view) => {
        return validProfileIds.includes(view.viewedBy)
      })
      .map((view) => {
        const fields = {
          _id: uuid(),
          viewedBy: view.viewedBy,
          date: view.date,
          postId: post._id,
          productionId: view._id,
          importedAt,
        }

        return {
          replaceOne: {
            filter: {
              productionId: fields.productionId,
            },
            replacement: fields,
            upsert: true,
            timestamps: false,
          },
        }
      })
  )
}
