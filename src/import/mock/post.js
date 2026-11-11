import faker from 'faker'
import mime from 'mime'
import moment from 'moment'
import { v4 as uuid } from 'uuid'
import { createPost } from 'Connectors/post'
import models from 'Models'
import { MediaSubType, MediaType } from 'Models/media/enums'
import { AWS } from 'Services'
import { buildContext } from 'Utils/auth'
import { Roles } from 'Utils/globals'
import { cloneMedia, sendMediaProcessSQSMessage } from 'Utils/media'
import { randomProfileId } from './fake'

const createMediaForPost = async (profile, postId) => {
  const medias = await models.Media.find({ ownerId: profile._id })
  const index = faker.datatype.number({ min: 0, max: 5 })
  const sourceMedia = medias[index]

  // Clone source media for the post
  const clonedMediaKey = uuid() // use random uuid as a cloned media's s3 object id
  const media = await cloneMedia({
    sourceMedia,
    profileId: profile._id,
    mediaType: MediaType.PICTURE,
    mediaSubType: MediaSubType.POST,
    reference: { postId },
    mediaKey: clonedMediaKey,
    socialProvider: false,
    importedAt: moment.utc().toDate(),
  })

  // Send a new message to sqs queue to process this cloned media
  const fileExt = mime.getExtension(media.mimetype)
  await sendMediaProcessSQSMessage({
    ...media.toObject(),
    fileExt,
    bucket: AWS.awsS3Bucket,
  })
}

const createFakeComments = async (postId, existingProfilesIds) => {
  const commentCount = faker.datatype.number({ min: 5, max: 50 })
  const comments = []
  for (let j = 0; j < commentCount; j++) {
    const date = faker.date.past(1)
    comments.push({
      _id: uuid(),
      content: faker.lorem.words(),
      commentedBy: randomProfileId(existingProfilesIds),
      date,
      createdAt: date,
      updatedAt: date,
    })
  }

  await models.PostComment.bulkWrite(
    comments.map((comment) => {
      const fields = {
        _id: comment._id,
        content: comment.content,
        webScraped: null,
        commentedBy: comment.commentedBy,
        postId,
        flagged: [],
        date: comment.createdAt,
        createdAt: comment.createdAt,
        updatedAt: comment.updatedAt,
      }

      return {
        replaceOne: {
          filter: {
            _id: comment._id,
            postId,
          },
          replacement: fields,
          upsert: true,
          timestamps: false,
        },
      }
    })
  )
}

const createFakeLikes = async (postId, existingProfilesIds) => {
  const likeCount = faker.datatype.number({ min: 5, max: 50 })
  const likes = []
  for (let j = 0; j < likeCount; j++) {
    const date = faker.date.past(1)
    likes.push({
      _id: uuid(),
      likedBy: randomProfileId(existingProfilesIds),
      date,
      createdAt: date,
      updatedAt: date,
    })
  }

  await models.PostLike.bulkWrite(
    likes.map((like) => {
      const fields = {
        _id: like._id,
        likedBy: like.likedBy,
        date: like.date,
        createdAt: like.createdAt,
        updatedAt: like.updatedAt,
      }

      return {
        replaceOne: {
          filter: {
            _id: like._id,
            postId,
          },
          replacement: fields,
          upsert: true,
          timestamps: false,
        },
      }
    })
  )
}

const createFakeViews = async (postId, existingProfilesIds) => {
  const viewCount = faker.datatype.number({ min: 5, max: 50 })
  const views = []
  for (let j = 0; j < viewCount; j++) {
    const date = faker.date.past(1)
    views.push({
      _id: uuid(),
      viewedBy: randomProfileId(existingProfilesIds),
      date,
      createdAt: date,
      updatedAt: date,
    })
  }

  await models.PostView.bulkWrite(
    views.map((view) => {
      const fields = {
        _id: view._id,
        viewedBy: view.viewedBy,
        date: view.date,
        createdAt: view.createdAt,
        updatedAt: view.updatedAt,
      }

      return {
        replaceOne: {
          filter: {
            _id: view._id,
            postId,
          },
          replacement: fields,
          upsert: true,
          timestamps: false,
        },
      }
    })
  )
}

const createFakePost = async (profile, index) => {
  const allProfiles = await models.Profile.find({}).lean()
  const existingProfilesIds = allProfiles.map((p) => p._id)

  const date = faker.date.past(2)
  const postPayload = {
    content: `Post-#${index}\n${faker.lorem.paragraph()}`,
    contentUpdatedAt: date,
    createdAt: date,
    updatedAt: date,
    hasMedia: true,
  }

  const context = await buildContext({
    activeProfileId: profile._id,
    activeUserId: profile.user,
    role: Roles.Admin,
  })
  const post = await createPost(postPayload, context)
  const postId = post._id
  await createMediaForPost(profile, postId)

  await Promise.all([
    createFakeComments(postId, existingProfilesIds),
    createFakeLikes(postId, existingProfilesIds),
    createFakeViews(postId, existingProfilesIds),
  ])
}

export const runPostImport = async () => {
  console.log('deleting existing posts and feeds...')
  await Promise.all([
    models.Post.deleteMany({}),
    models.PostView.deleteMany({}),
    models.PostComment.deleteMany({}),
    models.PostLike.deleteMany({}),
    models.Media.deleteMany({
      mediaSubType: MediaSubType.POST,
    }),
  ])

  // Note: Only add posts for the following 2 users
  const profiles = await models.Profile.find({
    email: {
      $in: [
        'shlomo@shabbat.com',
        'sagewannabe@aol.com',
        'ykoblick@tribextech.com',
      ],
    },
  }).lean()

  console.log(`faking posts and feeds for ${profiles.length} profiles...`)

  for (const profile of profiles) {
    const postCount = faker.datatype.number({ min: 5, max: 50 })

    for (let i = 0; i < postCount; i++) {
      await createFakePost(profile, i)
    }

    console.info(`Created ${postCount} fake posts`)
  }

  console.log('faked Posts')
}
