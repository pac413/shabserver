import models from 'Models'

// Clean up the related flagged contents when resource is deleted
export const deleteFlaggedContentsForResource = async (resourceId, type) => {
  await models.FlaggedContent.deleteMany({
    resourceId,
    type,
  })
}
