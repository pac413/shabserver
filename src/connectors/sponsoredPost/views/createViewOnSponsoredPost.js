import { orderBy } from 'lodash'
import moment from 'moment'
import { v4 as uuid } from 'uuid'
import models from 'Models'

export default async function createViewOnSponsoredPost(viewPayload, context) {
  const { activeProfileId } = context
  const { postId } = viewPayload

  const post = await models.SponsoredPost.findOne({ _id: postId })

  if (!post) {
    throw new Error(`No sponsored post with ${postId} not existing`)
  }

  const existingView = post.views.find(
    (view) => view.viewedBy._id === activeProfileId
  )
  if (existingView) {
    return existingView
  }

  // TODO: Check if you are allowed to add view to this post.
  const createdDate = moment.utc().toDate()
  const newView = {
    _id: uuid(),
    viewedBy: activeProfileId,
    createdAt: createdDate,
    date: createdDate,
  }

  post.views = orderBy([newView, ...post.views], ['date'], ['desc'])

  await post.save()
  return newView
}
