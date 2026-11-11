import models from 'Models'

export const addIsHiddenOrFlaggedComment = async () => {
  const profiles = await models.Profile.find({
    'restrictions.feed': true,
  })
    .select({ _id: 1 })
    .lean()

  const profileIds = profiles.map((profile) => profile._id)
  await models.PostComment.updateMany(
    { commentedBy: { $in: profileIds } },
    { hidden: true }
  )
  let result

  console.log('setting isHiddenOrFlagged: true')
  result = await models.PostComment.updateMany(
    {
      $or: [
        { hidden: true },
        { flagged: { $exists: true, $type: 'array', $ne: [] } },
      ],
    },
    {
      isHiddenOrFlagged: true,
    }
  )
  console.log('updated isHiddenOrFlagged: true', result)

  console.log('setting isHiddenOrFlagged: false')
  result = await models.PostComment.updateMany(
    { isHiddenOrFlagged: { $ne: true } },
    { isHiddenOrFlagged: false }
  )
  console.log('updated isHiddenOrFlagged: false', result)
}
