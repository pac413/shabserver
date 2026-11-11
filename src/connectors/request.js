import models from 'Models'

export async function deleteRequests(profileId, shouldHardDelete = false) {
  const whereOptions = {
    $or: [{ requestor: profileId }, { recipient: profileId }],
  }
  if (shouldHardDelete) {
    await models.Request.deleteMany(whereOptions)
  } else {
    await models.Request.delete(whereOptions).exec()
  }
}

export async function restoreRequests(profileId) {
  const whereOptions = {
    $or: [{ requestor: profileId }, { recipient: profileId }],
  }
  await models.Request.restore(whereOptions).exec()
}
