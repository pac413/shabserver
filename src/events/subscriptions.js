import pubsub, { EVENTS, PUBLISH } from 'Subscriptions'
import models from 'Models'
import {
  createPictureAddedPost,
  updatePictureAddedPost,
  getEligibleForGeneralFeed,
} from 'Connectors/post'
import { eventManager } from 'Events'
import { MediaSubType } from 'Models/media/enums'

export const publishMessage = (message) => {
  pubsub.publish(PUBLISH.MESSAGE, {
    // You need to pass the subscription schema name here
    subscribeToMessages: {
      message,
    },
  })
}

export const publishConversation = (conversation) => {
  pubsub.publish(PUBLISH.CONVERSATION, {
    subscribeToConversations: {
      conversation,
    },
  })
}

export const publishUserIsTyping = ({ conversation, mediaType, profileId }) => {
  pubsub.publish(PUBLISH.USER_IS_TYPING, {
    subscribeToUserIsTyping: {
      conversation,
      conversationId: conversation.id,
      mediaType,
      profileId,
    },
  })
}

export const publishNotification = async (notification) => {
  pubsub.publish(PUBLISH.NOTIFICATION, {
    subscribeToNotifications: {
      notification,
    },
  })
}

export const publishPostCreated = async ({ post }) => {
  pubsub.publish(PUBLISH.POST, {
    subscribeToPost: {
      post,
      event: EVENTS.POST.CREATED,
    },
  })
}

export const publishPostUpdated = async ({ post }) => {
  pubsub.publish(PUBLISH.POST, {
    subscribeToPost: {
      post,
      event: EVENTS.POST.UPDATED,
    },
  })
}

export const publishPostDeleted = async ({ post }) => {
  pubsub.publish(PUBLISH.POST, {
    subscribeToPost: {
      post,
      event: EVENTS.POST.DELETED,
    },
  })
}

// This handler has event param from which we can know if media is created or updated
// TODO: For now, we are not using this event param but leave it for future usage
export const publishMedia = async ({ media, event }) => {
  switch (media.mediaSubType) {
    case MediaSubType.PROFILE:
      {
        const profile = await models.Profile.findById(media.ownerId).lean()
        const profileEvent =
          event === eventManager.events.MEDIA_PROCESSED
            ? EVENTS.PROFILE.MEDIA_PROCESSED
            : EVENTS.PROFILE.PROFILE_UPDATED

        // Check if profile picture is edited
        const {
          shouldCreate: shouldCreateNewPost,
          shouldUpdate: shouldUpdatePost,
        } = await (async () => {
          let shouldCreate = false
          let shouldUpdate = false

          const { originalMediaId } = media.reference || {}
          if (
            event === eventManager.events.MEDIA_PROCESSED &&
            originalMediaId
          ) {
            const cnt = await models.Media.countDocuments({
              'reference.originalMediaId': originalMediaId,
              mediaSubType: MediaSubType.POST,
            })
            if (!cnt) {
              shouldCreate = true
            } else {
              shouldUpdate = true
            }
          }
          return { shouldCreate, shouldUpdate }
        })()

        if (shouldCreateNewPost) {
          createPictureAddedPost(profile, media)
        } else if (shouldUpdatePost) {
          updatePictureAddedPost(profile, media)
        }
        pubsub.publish(PUBLISH.PROFILE, {
          profile,
          event: profileEvent,
        })
      }
      break
    case MediaSubType.POST:
      {
        const { postId } = media.reference
        // Update post and related posts to use correct hasMedia value
        const hasMedia = event !== eventManager.events.MEDIA_DELETED
        const post = await models.Post.findById(postId)
        post.hasMedia = hasMedia
        post.eligibleForGeneralFeed = getEligibleForGeneralFeed(post)
        await post.save()
        const eventsMap = {
          [eventManager.events.MEDIA_PROCESSED]: EVENTS.POST.MEDIA_PROCESSED,
          [eventManager.events.MEDIA_UPLOADED]: EVENTS.POST.MEDIA_UPLOADED,
        }
        const eventName = eventsMap[event] || EVENTS.POST.UPDATED

        pubsub.publish(PUBLISH.POST, {
          subscribeToPost: {
            post: post.toObject(),
            event: eventName,
          },
        })
      }
      break
    case MediaSubType.COMMENT:
    case MediaSubType.COMMENT_REPLY:
      {
        const { postId } = media.reference
        const post = await models.Post.findById(postId).lean()
        const postEvent = (() => {
          switch (event) {
            case eventManager.events.MEDIA_UPLOADED:
              return EVENTS.POST.MEDIA_UPLOADED
            case eventManager.events.MEDIA_PROCESSED:
              return EVENTS.POST.MEDIA_PROCESSED
            default:
              return EVENTS.POST.UPDATED
          }
        })()

        pubsub.publish(PUBLISH.POST, {
          subscribeToPost: {
            post,
            event: postEvent,
          },
        })
      }
      break
    case MediaSubType.MESSAGE:
      {
        if (event !== eventManager.events.MEDIA_PROCESSED) {
          break
        }
        const message = await models.Message.findOne({
          attachments: { $in: [media._id] },
        })
        publishMessage(message)
      }
      break
    default:
      break
  }
}

export const publishProfileUpdated = async ({ profile }) => {
  pubsub.publish(PUBLISH.PROFILE, {
    profile,
    event: EVENTS.PROFILE.PROFILE_UPDATED,
  })
}
