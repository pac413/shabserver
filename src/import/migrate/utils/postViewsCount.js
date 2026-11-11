import Promise from 'bluebird'
import models from 'Models'
import { importLogger as logger } from 'Logger/importLogger'
import { migrateApi } from 'Services/migrateApi'

export const migrateSinglePostViewsCount = async (
  { _id: id, productionId },
  index
) => {
  console.log({
    event: 'SINGLE_POST_VIEWS_COUNT',
    message: `Starting to migrate post views for post ${id} ${productionId}`,
    index,
    postId: id,
    productionId: productionId,
  })

  let data
  try {
    data = await migrateApi.postViews.loadCountForSinglePost(productionId)
    console.log({
      event: 'API_POST_VIEWS_COUNT',
      message: `Loaded ${data.totalViews} views from the production api`,
      index,
      postId: id,
      productionId: productionId,
      total: data.totalViews,
    })
  } catch (err) {
    console.error({
      event: 'API_POST_VIEWS_COUNT',
      message: `${index}: Failed to load post views ${productionId}`,
      index,
      postId: id,
      productionId: productionId,
      err,
    })
    logger.alert({
      event: 'REPORT_POST_VIEWS_COUNT',
      message: `${index}: Failed to load post views ${productionId}`,
      index,
      postId: id,
      productionId: productionId,
      err,
    })
    return
  }

  try {
    await models.Post.updateOne(
      { _id: id },
      { migratedViewsCount: data.totalViews }
    )
    console.info({
      event: 'BULK_POST_VIEWS_COUNT',
      message: `${index}: Completed to migrate post views for for post ${id} ${productionId}`,
      index,
      postId: id,
      productionId: productionId,
    })
    logger.alert({
      event: 'REPORT_POST_VIEWS_COUNT',
      status: 'success',
      index,
      postId: id,
      productionId: productionId,
    })
  } catch (err) {
    const message = `${index}: Failed to migrate post views for for post ${id} ${productionId}`
    console.error({
      event: 'REPORT_POST_VIEWS_COUNT',
      message,
      index,
      postId: id,
      productionId: productionId,
      err,
    })
    logger.alert({
      event: 'REPORT_POST_VIEWS_COUNT',
      status: 'failed',
      index,
      postId: id,
      productionId: productionId,
      size: data.length,
      err,
    })
  }
}

export const migrateBulkPostViewsCount = async (profileId) => {
  const posts = await models.Post.find({
    productionId: { $exists: true },
    ...(profileId ? { postedBy: profileId } : {}),
  })
    .select({ _id: 1, productionId: 1 })
    .lean()

  await Promise.map(
    posts,
    (post, index) => migrateSinglePostViewsCount(post, index),
    {
      concurrency: 20,
    }
  )
}
