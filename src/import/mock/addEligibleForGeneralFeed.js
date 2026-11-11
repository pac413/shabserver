import models from 'Models'
import { PostType } from 'Models/post/enums'

export const addEligibleForGeneralFeed = async () => {
  console.log('setting eligibleForGeneralFeed: true')
  const postCursor = models.Post.find({
    $or: [
      { hasMedia: true },
      { webScraped: { $exists: true, $ne: null } },
      { type: PostType.BIRTHDAY_TODAY },
    ],
  })
    .select({ _id: 1 })
    .cursor()

  let index = 0
  for await (const post of postCursor) {
    index++
    await models.Post.updateOne(
      { _id: post._id },
      { eligibleForGeneralFeed: true }
    )
    console.log(`${index}: updated eligibleForGeneralFeed to true: ${post._id}`)
  }
}
