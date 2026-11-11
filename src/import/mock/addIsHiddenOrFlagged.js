import models from 'Models'

export const addIsHiddenOrFlagged = async () => {
  let result

  console.log('setting isHiddenOrFlagged: true')
  result = await models.Post.updateMany(
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
  result = await models.Post.updateMany(
    { isHiddenOrFlagged: { $ne: true } },
    { isHiddenOrFlagged: false }
  )
  console.log('updated isHiddenOrFlagged: false', result)
}
