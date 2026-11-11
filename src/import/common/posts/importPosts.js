import Promise from 'bluebird'
import { v4 as uuid } from 'uuid'
import { deleteMedia } from 'Connectors/media'
import { getProfileSettings } from 'Connectors/profileSettings'
import { importMedia } from 'Import/common/media/importMedia'
import { validProfileIds } from 'Import/common/validProfileIds'
import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { PostType } from 'Models/post/enums'
import { fetchWebScrapedData } from 'Services/iframely'

const populateFieldsFromData = (data, profileId, importedAt) => {
  return {
    _id: data._id,
    content: {
      content: data.content.content,
    },
    webScraped: null,
    migratedWebScrapedUrl: data.webScrapedUrl,
    migratedViewsCount: data.totalViews,
    productionId: data.productionId,
    postedBy: data.postedBy,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    lastActivityAt: data.updatedAt,
    contentUpdatedAt: data.updatedAt,
    flagged: [],
    share: [],
    hidden: data.hidden,
    status: data.status,
    hasMedia: data.hasMedia,
    type: data.type === 'JOB_POSTING' ? PostType.JOB_POSTING : PostType.DEFAULT,
    privacySetting: data.privacySetting,
    importedAt,
  }
}

const updateWebScraped = async (data) => {
  if (!data.webScrapedUrl) return

  let webScraped = null
  try {
    webScraped = await fetchWebScrapedData(data.webScrapedUrl)
  } catch (err) {
    logger.alert({
      event: 'POST_WEBSCRAPED',
      message: 'Failed to fetch webscraped url',
      webScrapedUrl: data.webScrapedUrl,
    })
  }

  if (!webScraped) return

  await models.Post.updateOne(
    { _id: data._id },
    {
      $set: {
        webScraped: webScraped,
      },
    }
  )
}

const importPostMedia = async (data, profileId, importedAt) => {
  const promises = []
  if (data.picture && data.picture.original) {
    const { original, thumbnail } = data.picture
    promises.push(
      importMedia(
        {
          original,
          ownerId: profileId,
          mediaType: MediaType.PICTURE,
          mediaSubType: MediaSubType.POST,
          reference: {
            postId: data._id,
          },
          mediaKey: `${data._id}_picture`,
          socialProvider: false,
          thumbnails: { thumbnail },
        },
        importedAt
      )
    )
  } else {
    promises.push(
      models.Media.findOne({
        ownerId: profileId,
        mediaType: MediaType.PICTURE,
        mediaSubType: MediaSubType.POST,
        reference: {
          postId: data._id,
        },
      }).then(
        (media) => media && deleteMedia({ id: media._id, keepOriginal: true })
      )
    )
  }
  if (data.video && data.video.videoUrl) {
    const { videoUrl, videoImage } = data.video
    promises.push(
      importMedia(
        {
          original: videoUrl,
          ownerId: profileId,
          mediaType: MediaType.VIDEO,
          mediaSubType: MediaSubType.POST,
          reference: {
            postId: data._id,
          },
          mediaKey: `${data._id}_video`,
          socialProvider: false,
          thumbnails: { thumbnail: videoImage },
        },
        importedAt
      )
    )
  } else {
    promises.push(
      models.Media.findOne({
        ownerId: profileId,
        mediaType: MediaType.VIDEO,
        mediaSubType: MediaSubType.POST,
        reference: {
          postId: data._id,
        },
      }).then(
        (media) => media && deleteMedia({ id: media._id, keepOriginal: true })
      )
    )
  }
  if (data.webScrapedUrl) {
    promises.push(updateWebScraped(data))
  }

  return Promise.all(promises)
}

export const importPosts = async (posts, profileId, importedAt) => {
  console.log({
    event: 'IMPORT_POSTS',
    message: `Importing ${posts.length} posts for ${profileId}`,
    profileId,
  })

  const profileSettings = await getProfileSettings(profileId)

  await Promise.all(
    posts.map(async (post) => {
      post.productionId = post._id
      post.privacySetting = profileSettings.postPrivacy

      const existingPost = await models.Post.findOne({
        productionId: post.productionId,
      })
        .select({ _id: 1 })
        .lean()

      if (existingPost) {
        post._id = existingPost._id
      } else {
        post._id = uuid()
      }
    })
  )

  await models.Post.bulkWrite(
    posts.map((data) => {
      const fields = populateFieldsFromData(data, profileId, importedAt)
      return {
        replaceOne: {
          filter: {
            _id: data._id,
          },
          replacement: fields,
          upsert: true,
          timestamps: false,
        },
      }
    })
  )

  // Migrate post comments
  await Promise.all(
    posts.map(async (data) => {
      await models.PostComment.bulkWrite(
        data.comments
          .filter((comment) => {
            return validProfileIds.includes(comment.commentedBy)
          })
          .map((comment) => {
            const fields = {
              content: comment.content,
              webScraped: null,
              commentedBy: comment.commentedBy,
              postId: data._id,
              flagged: [],
              productionId: comment._id,
              date: comment.createdAt,
              createdAt: comment.createdAt,
              updatedAt: comment.updatedAt,
              importedAt,
            }

            return {
              replaceOne: {
                filter: {
                  productionId: fields.productionId,
                },
                replacement: fields,
                upsert: true,
                timestamps: false,
              },
            }
          })
      )
    })
  )

  // Migrate post likes
  await Promise.all(
    posts.map(async (data) => {
      await models.PostLike.bulkWrite(
        data.likes
          .filter((like) => {
            return validProfileIds.includes(like.likedBy)
          })
          .map((like) => {
            const fields = {
              likedBy: like.likedBy,
              date: like.date,
              postId: data._id,
              productionId: like._id,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
              importedAt,
            }

            return {
              replaceOne: {
                filter: {
                  productionId: fields.productionId,
                },
                replacement: fields,
                upsert: true,
                timestamps: false,
              },
            }
          })
      )
    })
  )

  await Promise.map(
    posts,
    async (post) => importPostMedia(post, profileId, importedAt),
    {
      concurrency: 20,
    }
  )
}
