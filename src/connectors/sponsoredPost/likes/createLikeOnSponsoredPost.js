import { orderBy } from 'lodash'
import moment from 'moment'
import { v4 as uuid } from 'uuid'
import models from 'Models'

export default async function createLikeOnSponsoredPost(likePayload, context) {
  const { activeProfileId } = context
  const { postId } = likePayload

  const post = await models.SponsoredPost.findOne({ _id: postId })

  if (!post) {
    throw new Error(`No sponsored post with ${postId} not existing`)
  }

  const existingLike = post.likes.find(
    (like) => like.likedBy === activeProfileId
  )
  if (existingLike) {
    return existingLike
  }

  // TODO: Check if you are allowed to add like to this post.
  const createdDate = moment.utc().toDate()
  const newLike = {
    _id: uuid(),
    likedBy: activeProfileId,
    createdAt: createdDate,
    date: createdDate,
  }

  post.likes = orderBy([newLike, ...post.likes], ['date'], ['desc'])

  await post.save()
  return newLike
}
