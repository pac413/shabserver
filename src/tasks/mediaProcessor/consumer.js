import { Consumer } from 'sqs-consumer'
import { AWS } from 'Services'
import { eventManager } from 'Events'
import { setupLogger } from 'Logger'
import models, { connectDb } from 'Models'
import { MediaStatus, MediaSubType, MediaType } from 'Models/media/enums'
import setupI18n from 'Server/i18n'
import { processPicture } from './processors/picture'
import { processVideo } from './processors/video'
import { processAudio } from './processors/audio'
import { triggerNotification } from './notification'

setupLogger('media-processor')
setupI18n()

const app = Consumer.create({
  queueUrl: AWS.getMediaSQSQueueUrl(),
  handleMessage: async (message) => {
    const attributes = message.MessageAttributes
    const id = message.Body

    console.info('Started processing media: ', id)

    const messageObj = Object.keys(attributes).reduce(
      (obj, key) => {
        obj[key] =
          attributes[key].DataType === 'Number'
            ? parseInt(attributes[key].StringValue)
            : attributes[key].StringValue
        return obj
      },
      { id }
    )
    const { mediaType, mediaSubType } = messageObj

    if (!mediaType) {
      console.error('Invalid message attributes: Cannot find MediaType')
      return
    }

    if (!mediaSubType) {
      console.error('Invalid message attributes: Cannot find MediaSubType')
      return
    }

    try {
      switch (mediaType) {
        case MediaType.PICTURE:
          await processPicture(id, messageObj)
          break
        case MediaType.VIDEO:
          await processVideo(id, messageObj)
          break
        case MediaType.AUDIO:
          await processAudio(id, messageObj)
          break
        default:
          throw new Error(`Cannot find the proper processor for ${mediaType}`)
      }
      console.info(`Successfully processed media: ${id}`)

      // emit MEDIA_PROCESSED event
      const media = await models.Media.findById(id)
      eventManager.emit(eventManager.events.MEDIA_PROCESSED, {
        media,
        event: eventManager.events.MEDIA_PROCESSED,
      })

      // Trigger notification if this media is for post or comment
      if (
        mediaSubType === MediaSubType.POST ||
        mediaSubType === MediaSubType.COMMENT ||
        mediaSubType === MediaSubType.COMMENT_REPLY
      ) {
        await triggerNotification(messageObj)
      }
    } catch (error) {
      // revert media document status as uploaded
      await models.Media.updateOne(
        { _id: id },
        {
          $set: {
            status: MediaStatus.UPLOADED,
          },
        }
      )
      console.error('Error while processing media: ', id, error)
    }
  },
  messageAttributeNames: [
    'mediaType',
    'mediaSubType',
    'bucket',
    'fileExt',
    'mimetype',
    's3Key',
    'ownerId',
    'reference',
  ],
  sqs: AWS.getSQSClient(),
})

app.on('error', (err) => {
  console.error(err.message)
})

app.on('processing_error', (err) => {
  console.error(err.message)
})

app.on('timeout_error', (err) => {
  console.error(err.message)
})

connectDb(process.env.DB_URL).then(() => {
  app.start()
  console.info('Media processor started...')
})
