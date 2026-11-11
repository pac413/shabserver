import models from 'Models'

export async function deleteEndorsements(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ endorser: profileId }, { profile: profileId }],
  }
  if (shouldHardDelete) {
    await models.Endorsement.deleteMany(whereOptions)
  } else {
    await models.Endorsement.delete(whereOptions).exec()
  }
}
