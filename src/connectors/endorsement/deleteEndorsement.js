import models from 'Models'
import { FlaggedContentType } from 'Models/flaggedContent/enums'
import { deleteFlaggedContentsForResource } from 'Utils/admin'

export const deleteEndorsement = async (id) => {
  await models.Endorsement.delete({ _id: id })

  // clean up the related flagged contents for this endorsement
  await deleteFlaggedContentsForResource(id, FlaggedContentType.ENDORSEMENT)

  return { deleted: true }
}
