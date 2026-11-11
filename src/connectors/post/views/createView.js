import moment from 'moment'
import { checkAccessToPost } from 'Connectors/post'
import { eventManager } from 'Events'
import models from 'Models'

export default async function createView(post, context) {
  const { activeProfileId } = context

  const hasAccess = await checkAccessToPost(post, context)
  if (!hasAccess) {
    return null
  }

  const createdDate = moment.utc().toDate()
  const fields = {
    postId: post._id,
    viewedBy: activeProfileId,
    date: createdDate,
  }

  const view = await models.PostView.findOneAndUpdate(
    {
      viewedBy: fields.viewedBy,
      postId: fields.postId,
    },
    fields,
    { new: true, upsert: true }
  )

  eventManager.emit(eventManager.events.POST_UPDATED, { post })

  return view
}
