import models from 'Models'

export const updateFeedRestrictions = async () => {
  const profiles = await models.Profile.find({
    'restrictions.feed': true,
  })
    .select({ _id: 1 })
    .lean()
  console.log(`Loaded ${profiles.length} feed restricted profiles`)

  const profileIds = profiles.map((profile) => profile._id)

  let result
  console.log('setting isHiddenOrFlagged: false to all profiles for now.')
  result = await models.Post.updateMany(
    { isHiddenOrFlagged: { $ne: true } },
    { isHiddenOrFlagged: false }
  )
  console.log('updated isHiddenOrFlagged: false', result)

  console.log('setting hidden: true and isHiddenOrFlagged: true')
  await models.Post.updateMany(
    { postedBy: { $in: profileIds } },
    {
      hidden: true,
      isHiddenOrFlagged: true,
    }
  )

  console.log('setting isHiddenOrFlagged: true')
  result = await models.Post.updateMany(
    { flagged: { $exists: true, $type: 'array', $ne: [] } },
    { isHiddenOrFlagged: true }
  )
  console.log('updated isHiddenOrFlagged: true', result)
}
