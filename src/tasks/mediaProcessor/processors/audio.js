import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import models from 'Models'
import { MediaStatus } from 'Models/media/enums'
import { uploadToS3 } from 'Utils/media'
import { downloadS3Object } from './helper'

const tmpDirPath = path.join(__dirname, '../../../../tmp/')

export const processAudio = async (id, messageObj) => {
  try {
    await models.Media.updateOne(
      { _id: id },
      {
        $set: {
          status: MediaStatus.PROCESSING,
        },
      }
    )
  } catch (err) {
    console.error('Media model update error: ', err)
    return
  }

  try {
    fs.mkdirSync(tmpDirPath, { recursive: true })
  } catch (err) {
    console.log('Failed to create a tmp folder for ffmpeg commands: ', err)
  }

  try {
    await downloadS3Object(messageObj, tmpDirPath)
    const fileName = await convertOriginalAudio(messageObj)
    const meta = await getMeta(messageObj, fileName)

    await models.Media.updateOne(
      { _id: id },
      {
        $set: {
          status: MediaStatus.COMPLETED,
          meta,
        },
      }
    )
  } finally {
    console.info('Deleting all tmp files')
    fs.readdirSync(tmpDirPath)
      .filter((file) => file.includes(id))
      .map((file) => fs.unlinkSync(path.join(tmpDirPath, file)))
    console.info('Deleted all tmp files')
  }
}

/**
 * Convert original audio file into mp3
 * @param {*} messageObj sqs message object that contains media info
 */
const convertOriginalAudio = async (messageObj) =>
  new Promise((resolve, reject) => {
    const { id, mediaType, mediaSubType, ownerId, mimetype, fileExt } =
      messageObj
    const tmpOriginalFile = path.join(tmpDirPath, `${id}.${fileExt}`)
    // Converted mp3 file path for original audio
    const tmpTargetFilename = `${id}_converted`
    const tmpTargetFilePath = path.join(tmpDirPath, `${tmpTargetFilename}.mp3`)

    // Convert webm audio into mp3
    if (mimetype === 'audio/webm') {
      ffmpeg(tmpOriginalFile)
        .audioFrequency(44100)
        .audioChannels(2)
        .audioBitrate('192k')
        .on('start', () => {
          console.info('Converting original audio into mp3')
        })
        .on('error', function (err) {
          console.error('Failed to convert original audio into mp3: ', err)
          reject(err)
        })
        .on('end', async () => {
          console.info(`Converted original audio into mp3, Uploading it to s3`)
          const s3Key = await uploadToS3(
            mediaType,
            mediaSubType,
            ownerId,
            tmpTargetFilename,
            'mp3',
            'audio/mpeg',
            fs.readFileSync(tmpTargetFilePath)
          )
          console.info(`Uploaded converted audio to s3`)

          // Update media document by replacing original media with converted one
          await models.Media.updateOne(
            { _id: id },
            {
              $set: {
                mimetype: 'audio/mpeg',
                originalFilename: `${tmpTargetFilename}.mp3`,
                s3Key: s3Key,
              },
            }
          )
          resolve(`${tmpTargetFilename}.mp3`)
        })
        .save(tmpTargetFilePath)
    } else {
      resolve(`${id}.${fileExt}`)
    }
  })

/**
 * Get meta info from the audio
 * @param {*} messageObj sqs message object that contains media info
 */
const getMeta = async (messageObj, tmpTargetFilename) =>
  new Promise((resolve, reject) => {
    const tmpTargetFilePath = path.join(tmpDirPath, tmpTargetFilename)

    ffmpeg.ffprobe(tmpTargetFilePath, (err, metadata) => {
      if (err) {
        console.error(`Failed to get audio meta: `, err)
        reject(err)
        return
      }
      const {
        format: { duration, size },
      } = metadata
      if (typeof duration === 'number' && typeof size === 'number') {
        resolve({ duration, size })
      } else {
        reject(new Error('Failed to get meta data for this audio file'))
      }
    })
  })
