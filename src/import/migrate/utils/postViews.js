import moment from 'moment'
import models from 'Models'
import { importPostViews } from 'Import/common/posts/importPostViews'
import { importLogger as logger } from 'Logger/importLogger'
import { migrateApi } from 'Services/migrateApi'

export const migrateSinglePostView = async (post, index) => {
  const importedAt = moment.utc().toDate()
  console.log({
    event: 'SINGLE_POST_VIEWS',
    message: `Starting to migrate post views for post ${post._id} ${post.productionId}`,
    index,
    postId: post._id,
    productionId: post.productionId,
  })

  let data
  try {
    data = await migrateApi.postViews.loadForSinglePost(post.productionId)
    console.log({
      event: 'API_POST_VIEWS',
      message: `Loaded ${data.TotalPostViews} views from the production api`,
      index,
      postId: post._id,
      productionId: post.productionId,
      total: data.TotalPostViews,
    })
  } catch (err) {
    console.error({
      event: 'API_POST_VIEWS',
      message: `${index}: Failed to load post views ${post.productionId}`,
      index,
      postId: post._id,
      productionId: post.productionId,
      err,
    })
    logger.alert({
      event: 'REPORT_POST_VIEWS',
      message: `${index}: Failed to load post views ${post.productionId}`,
      index,
      postId: post._id,
      productionId: post.productionId,
      err,
    })
    return
  }

  try {
    await importPostViews(post, data.views, importedAt)
    console.info({
      event: 'BULK_POST_VIEWS',
      message: `${index}: Completed to migrate post views for for post ${post._id} ${post.productionId}`,
      index,
      postId: post._id,
      productionId: post.productionId,
    })
    logger.alert({
      event: 'REPORT_POST_VIEWS',
      status: 'success',
      index,
      postId: post._id,
      productionId: post.productionId,
    })
  } catch (err) {
    const message = `${index}: Failed to migrate post views for for post ${post._id} ${post.productionId}`
    console.error({
      event: 'BULK_POSTS',
      message,
      index,
      postId: post._id,
      productionId: post.productionId,
      err,
    })
    logger.alert({
      event: 'REPORT_POSTS',
      status: 'failed',
      index,
      postId: post._id,
      productionId: post.productionId,
      size: data.length,
      err,
    })
  }
}

export const migrateBulkPostViews = async (profileId) => {
  const postCursor = models.Post.find({
    productionId: { $exists: true },
    ...(profileId ? { postedBy: profileId } : {}),
  }).cursor()
  let index = 0
  for await (const post of postCursor) {
    await migrateSinglePostView(post, index)
    index++
  }
}
