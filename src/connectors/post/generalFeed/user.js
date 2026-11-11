import { cloneDeep, difference, uniq } from 'lodash'
import { getActionBlockingProfileIds } from 'Connectors/blocking'
import { getAllFollowingProfileIds } from 'Connectors/follower'
import { getFriendProfileIds } from 'Connectors/friends'
import { getConnectionsMutedByMe } from 'Connectors/mutedConnection'
import models from 'Models'
import { PostType } from 'Models/post/enums'
import {
  FeedContentSetting,
  PostPrivacySetting,
} from 'Models/profileSettings/enums'
import { getProfileSettings } from 'Connectors/profileSettings'

const getPostedByFromConnections = async (activeProfileId) => {
  const [
    blockingProfileIds,
    mutedProfileIds,
    friendProfileIds,
    followingProfileIds,
  ] = await Promise.all([
    getActionBlockingProfileIds(activeProfileId),
    getConnectionsMutedByMe(activeProfileId),
    getFriendProfileIds({
      profileId: activeProfileId,
      activeProfileId,
    }),
    getAllFollowingProfileIds({
      profileId: activeProfileId,
      activeProfileId,
      excludeBlockings: true,
    }),
  ])

  return {
    friends: difference(uniq(friendProfileIds), [
      ...blockingProfileIds,
      ...mutedProfileIds,
    ]),
    connections: difference(
      uniq(friendProfileIds.concat(followingProfileIds)),
      [...blockingProfileIds, ...mutedProfileIds]
    ),
    forbidden: blockingProfileIds.concat(mutedProfileIds),
  }
}

const getPublicQuery = async (activeProfileId) => {
  const { friends, connections, forbidden } = await getPostedByFromConnections(
    activeProfileId
  )

  return {
    feedQuery: {
      eligibleForGeneralFeed: true,
      excludedFromFeedByAdmin: { $ne: true },
      $or: [
        {
          postedBy: activeProfileId,
        },
        {
          isHiddenOrFlagged: { $ne: true },
          privacySetting: PostPrivacySetting.ALL,
          ...(forbidden.length > 0 ? { postedBy: { $nin: forbidden } } : {}),
          type: { $ne: PostType.BIRTHDAY_TODAY },
        },
        {
          isHiddenOrFlagged: { $ne: true },
          privacySetting: PostPrivacySetting.CONNECTIONS,
          postedBy: { $in: connections },
        },
        {
          isHiddenOrFlagged: { $ne: true },
          privacySetting: PostPrivacySetting.FRIENDS,
          postedBy: { $in: friends },
        },
      ],
    },
    indexName: 'publicConnectionsGeneralFeedIndex',
  }
}

const getTrendingQuery = async (activeProfileId) => {
  const { friends, connections, forbidden } = await getPostedByFromConnections(
    activeProfileId
  )

  return {
    feedQuery: {
      eligibleForGeneralFeed: true,
      excludedFromFeedByAdmin: { $ne: true },
      $or: [
        {
          postedBy: activeProfileId,
        },
        {
          isHiddenOrFlagged: { $ne: true },
          privacySetting: PostPrivacySetting.ALL,
          ...(forbidden.length > 0 ? { postedBy: { $nin: forbidden } } : {}),
        },
        {
          isHiddenOrFlagged: { $ne: true },
          privacySetting: PostPrivacySetting.CONNECTIONS,
          postedBy: { $in: connections },
        },
        {
          isHiddenOrFlagged: { $ne: true },
          privacySetting: PostPrivacySetting.FRIENDS,
          postedBy: { $in: friends },
        },
      ],
      type: { $ne: PostType.BIRTHDAY_TODAY },
    },
    indexName: 'trendingGeneralFeedIndex',
  }
}

const getConnectionsQuery = async (activeProfileId) => {
  const { friends, connections } = await getPostedByFromConnections(
    activeProfileId
  )

  return {
    feedQuery: {
      eligibleForGeneralFeed: true,
      excludedFromFeedByAdmin: { $ne: true },
      $or: [
        {
          postedBy: activeProfileId,
        },
        {
          postedBy: { $in: connections },
          isHiddenOrFlagged: { $ne: true },
          privacySetting: { $ne: PostPrivacySetting.FRIENDS },
        },
        {
          postedBy: { $in: friends },
          isHiddenOrFlagged: { $ne: true },
        },
      ],
    },
    indexName: 'publicConnectionsGeneralFeedIndex',
  }
}

const getQuery = async (activeProfileId, profileSettings) => {
  const feedContentSetting = profileSettings.feedContent

  if (feedContentSetting === FeedContentSetting.PUBLIC) {
    return getPublicQuery(activeProfileId)
  }

  if (feedContentSetting === FeedContentSetting.TRENDING) {
    return getTrendingQuery(activeProfileId)
  }

  return getConnectionsQuery(activeProfileId)
}

/**
 * Get paginated general feeds for active profile
 * @param {*} input InputPayload - { profileId, limit, offset }
 * @param {*} context Context - { activeProfileId }
 */
export const getGeneralFeed = async (input, context) => {
  const { offset, limit } = input
  const profileSettings = await getProfileSettings(context.activeProfileId)
  const { feedQuery, indexName } = await getQuery(
    context.activeProfileId,
    profileSettings
  )
  const total = await models.Post.countDocuments(feedQuery)
  if (total === 0) {
    return { total, posts: [] }
  }

  let sortBy = 'createdAt'
  if (profileSettings.feedContent === FeedContentSetting.TRENDING) {
    sortBy = 'lastActivityAt'
  }

  const posts = await models.Post.find(feedQuery)
    .sort({ [sortBy]: -1 })
    .hint(indexName)
    .skip(offset)
    .limit(limit)
    .lean()

  return { total, posts }
}

/**
 * Get new general feeds count for active profile
 * @param {*} lastPostDate Last Feed Item date to fetch new feed item count
 * @param {*} context Context - { activeProfileId }
 */
export const getNewGeneralFeedCount = async (
  lastPostDate,
  { activeProfileId }
) => {
  const profileSettings = await getProfileSettings(activeProfileId)
  const feedQuery = await getQuery(activeProfileId, profileSettings)
  const newFeedQuery = cloneDeep(feedQuery)
  if (profileSettings.feedContent === FeedContentSetting.TRENDING) {
    newFeedQuery.lastActivityAt = { $gt: new Date(lastPostDate) }
  } else {
    newFeedQuery.createdAt = { $gt: new Date(lastPostDate) }
  }
  const [newCount, total] = await Promise.all([
    models.Post.countDocuments(newFeedQuery),
    models.Post.countDocuments(feedQuery),
  ])

  return { newCount, total }
}
