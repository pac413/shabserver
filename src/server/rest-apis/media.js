import * as Sentry from '@sentry/node'
import { respondNotFoundError, respondUnauthenticatedError } from 'Errors/rest'
import models from 'Models'
import { MediaSubType } from 'Models/media/enums'
import { AWS } from 'Services'

const getMediaSignedUrl = async (media, thumbnail) => {
  const { s3Key, thumbnails } = media

  const key = (() => {
    if (!thumbnail) {
      return s3Key
    } else {
      const thumbnailItem = thumbnails.find((thumb) => thumb.name === thumbnail)
      if (thumbnailItem) {
        return thumbnailItem.s3Key
      } else {
        // thumbnail doesn't exist in the db
        return s3Key
      }
    }
  })()
  return AWS.getCfSignedUrl(key)
}

export function setupMedia(app) {
  app.get('/media/:mediaId', async (req, res, next) => {
    const { mediaId } = req.params
    const { thumbnail } = req.query
    const media = await models.Media.findById(mediaId).lean()

    if (!media) {
      console.error('INVALID_MEDIA_ID', { mediaId })
      Sentry.captureException(new Error('INVALID_MEDIA_ID', { mediaId }))
      return respondNotFoundError(req, res)
    }

    // Set Cache-Control header as no-cache for quicktime videos because they will be replaced with mp4 files by media processor
    // This will help the frontend to load the mp4 file properly even for the same media url
    const noCacheMimeTypes = ['video/quicktime', 'audio/webm']
    if (noCacheMimeTypes.includes(media.mimetype)) {
      res.set('Cache-Control', 'no-cache')
    }

    if (!req.user) {
      // POST, COMMENT, COMMENT_REPLY medias can be retrieved without user authentication
      const publicMediaSubTypes = [
        MediaSubType.POST,
        MediaSubType.COMMENT,
        MediaSubType.COMMENT_REPLY,
      ]
      if (!publicMediaSubTypes.includes(media.mediaSubType)) {
        return respondUnauthenticatedError(req, res)
      }

      const mediaUrl = await getMediaSignedUrl(media, thumbnail)
      res.redirect(301, mediaUrl)
      return
    }
    const { profileId } = req.user

    // If the requested user is owner of the media
    if (media.ownerId === profileId) {
      const mediaUrl = await getMediaSignedUrl(media, thumbnail)

      res.redirect(301, mediaUrl)
      return
    }

    if (media.mediaSubType === MediaSubType.MESSAGE) {
      const conversation = await models.Conversation.findById(
        media.reference.conversationId
      )

      // If the conversation doesn't exist, return 401 error
      if (!conversation) {
        return respondUnauthenticatedError(req, res)
      }

      // If the current authorized user is not among conversation's participants,
      // return 401 error as it has no access.
      const isExistingParticipant = conversation.participants
        .map((p) => p.participant)
        .includes(profileId)

      if (!isExistingParticipant) {
        return respondUnauthenticatedError(req, res)
      }
    }
    const mediaUrl = await getMediaSignedUrl(media, thumbnail)

    res.redirect(301, mediaUrl)
  })
}
