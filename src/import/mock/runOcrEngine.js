import vision from '@google-cloud/vision'
import models from 'Models'
import { MediaType, MediaSubType, MediaStatus } from 'Models/media/enums'
import { response } from 'express'

const isTextImage = (detection) => {
  if (detection.faceAnnotations && detection.faceAnnotations.length > 0) {
    return false
  }
  if (detection.textAnnotations && detection.textAnnotations.length > 0) {
    const words = detection.textAnnotations
      .map((text) => text.description || '')
      .join('')
    return words.trim().length > 0
  }
  return false
}

export const runOcrEngine = async () => {
  const client = new vision.ImageAnnotatorClient({
    credentials: JSON.parse(
      process.env.GOOGLE_CLOUD_VISION_SERVICE_ACCOUNT_CREDENTIALS || {}
    ),
  })
  let skip = 0
  const limit = 15

  while (1) {
    console.info(`Querying ${limit} profiles with avatar from ${skip}`)
    const profiles = await models.Profile.find({
      avatar: {
        $exists: true,
        $nin: [null, ''],
      },
      createdAt: { $gte: new Date('2021-02-01T00:00:00.000+00:00') },
    })
      .select({ _id: 1, avatar: 1, handle: 1 })
      .skip(skip)
      .limit(limit)
    if (profiles.length === 0) {
      break
    }

    skip += profiles.length

    const mediaList = await models.Media.find({
      _id: { $in: profiles.map((profile) => profile.avatar) },
      mediaType: MediaType.PICTURE,
      mediaSubType: MediaSubType.AVATAR,
      status: MediaStatus.COMPLETED,
    })
    console.info(`Processing ${mediaList.length} avatar with Ocr Engine`)
    if (mediaList.length === 0) {
      break
    }

    const items = mediaList.map((media) => {
      const profile = profiles.find(({ avatar }) => avatar === media._id)
      return {
        media,
        profile,
      }
    })

    const requests = items.map((item) => {
      return {
        image: {
          source: {
            imageUri: item.media.originalUrl,
          },
        },
        features: [
          {
            maxResults: 10,
            type: 'FACE_DETECTION',
          },
          {
            maxResults: 1,
            type: 'TEXT_DETECTION',
          },
        ],
        imageContext: {
          languageHints: ['en'],
        },
      }
    })
    const [{ responses: detections }] = await client.batchAnnotateImages({
      requests,
    })
    await models.OcrResult.bulkWrite(
      items.map((item, i) => {
        const detection = detections[i]
        const fields = {
          profileId: item.profile._id,
          profileHandle: item.profile.handle,
          mediaId: item.media._id,
          originalUrl: item.media.originalUrl,
          ocr: {},
          isTextImage: false,
        }

        if (response.error) {
          console.error(`API Error`, { item, error: response.error })
        } else {
          fields.ocr = detection
          fields.isTextImage = isTextImage(detection)
        }
        return {
          replaceOne: {
            filter: {
              mediaId: item.mediaId,
            },
            replacement: fields,
            upsert: true,
            timestamps: false,
          },
        }
      })
    )
  }

  console.info(`Successfully saved ocr result for ${skip} profiles`)
}
