import models from 'Models'

export const getEndorsement = async (id) => {
  const endorsement = await models.Endorsement.findById(id)
  return endorsement
}
