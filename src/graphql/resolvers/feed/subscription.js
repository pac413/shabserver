import { withFilter } from 'graphql-subscriptions'
import followingCache from 'Connectors/follower/cache/followingCache'
import friendCache from 'Connectors/friends/cache/friendCache'
import { checkAccessToPost, getNewGeneralFeedCount } from 'Connectors/post'
import { getProfileSettings } from 'Connectors/profileSettings'
import { PostType, SubscribeToPostType } from 'Models/post/enums'
import { FeedContentSetting } from 'Models/profileSettings/enums'
import pubsub, { EVENTS, PUBLISH } from 'Subscriptions'

export default {
  subscribeToFeed: {
    resolve: async ({ subscribeToPost: { post, event } }) => {
      let objectPost

      // check if this is mongodb object or not
      if ('toObject' in post) {
        objectPost = post.toObject()
      } else {
        objectPost = { ...post }
      }

      return { feedItem: objectPost, event }
    },
    subscribe: withFilter(
      (args) => pubsub.asyncIterator(PUBLISH.POST),
      async ({ subscribeToPost: { post, event } }, { input }, context) => {
        // Feed Created event will be handled in another subscription
        if (event === EVENTS.POST.CREATED) {
          return false
        }

        const hasAccess = await checkAccessToPost(post, context)
        if (!hasAccess) {
          return false
        }

        // Feed Deleted event will be always handled
        if (event === EVENTS.POST.DELETED) {
          return true
        }
        // feed_item_media_uploaded, feed_item_media_processed events should be handled
        if (
          event === EVENTS.POST.MEDIA_UPLOADED ||
          event === EVENTS.POST.MEDIA_PROCESSED
        ) {
          return true
        }
        const { feedItemIds, profileId, type } = input
        /**
         * If the subscription type is `General` - subscription to general feed,
         *  we have to check if the post has media/web-scraped content.
         * If the subscription type is `Profile` - subscription to profile feed,
         *  we don't have to check if the post has media/web-scraped content or not.
         */
        const postEligible =
          type !== SubscribeToPostType.GENERAL || post.isEligibleForGeneralFeed

        if (post.profileId === profileId) {
          return postEligible
        }

        return feedItemIds.includes(post._id)
      }
    ),
  },

  subscribeToNewFeedCount: {
    resolve: async (_, { input }, context) => {
      const { lastFeedItemDate } = input
      const { newCount: count, total } = await getNewGeneralFeedCount(
        lastFeedItemDate,
        context
      )

      return { count, total }
    },
    subscribe: withFilter(
      (args) => pubsub.asyncIterator(PUBLISH.POST),
      async ({ subscribeToPost: { post, event } }, { input }, context) => {
        const eventsToHandle = [
          EVENTS.POST.CREATED,
          EVENTS.POST.DELETED,
          EVENTS.POST.MEDIA_PROCESSED,
          EVENTS.POST.MEDIA_UPLOADED,
        ]
        const { activeProfileId } = context
        const { lastFeedItemDate } = input
        const postedDateTime = new Date(post.createdAt).getTime()
        const lastPostDateTime = new Date(lastFeedItemDate).getTime()
        // Feed Created event will be handled here to recalculate count
        if (
          !eventsToHandle.includes(event) ||
          post.postedBy === activeProfileId ||
          postedDateTime <= lastPostDateTime ||
          post.excludedFromFeedByAdmin
        ) {
          return false
        }

        const hasAccess = await checkAccessToPost(post, context)
        if (!hasAccess) {
          return false
        }

        const [activeProfileSettings, isFollowing, isFriend] =
          await Promise.all([
            getProfileSettings(activeProfileId),
            followingCache.isOneExisting(activeProfileId, post.postedBy),
            friendCache.isOneExisting(activeProfileId, post.postedBy),
          ])

        const { feedContent } = activeProfileSettings

        if (feedContent === FeedContentSetting.ALL) {
          return true
        }

        if (feedContent === FeedContentSetting.PUBLIC) {
          return (
            isFollowing || isFriend || post.type !== PostType.BIRTHDAY_TODAY
          )
        }

        if (feedContent === FeedContentSetting.TRENDING) {
          return post.type !== PostType.BIRTHDAY_TODAY
        }

        return isFollowing || isFriend
      }
    ),
  },
}
