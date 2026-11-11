import moment from 'moment'
import { v4 as uuid } from 'uuid'
import models from 'Models'
import { PostStatus, PostType } from 'Models/post/enums'

export default async function createSponsoredPost(postPayload, context) {
  const { activeProfileId } = context

  const post = await models.SponsoredPost.create({
    _id: uuid(),
    contentUpdatedAt: moment.utc().toDate(),
    comments: [],
    likes: [],
    views: [],
    postedBy: activeProfileId,
    flagged: [],
    status: PostStatus.ACTIVE,
    type: PostType.DEFAULT,
    ...postPayload,
  })

  return models.SponsoredPost.findOne({ _id: post._id })
}
