import models from 'Models'

export const updateEndorsement = async (id, input) => {
  await models.Endorsement.updateOne({ _id: id }, input)
  const endorsement = await models.Endorsement.findById(id)
  return endorsement
}
