import models from 'Models'

export async function restoreEndorsements(profileId) {
  const whereOptions = {
    $or: [{ endorser: profileId }, { profile: profileId }],
  }
  await models.Endorsement.restore(whereOptions).exec()
}
