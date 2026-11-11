/* eslint-disable no-async-promise-executor */
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import models from 'Models'
import { MediaStatus, VideoOrientation } from 'Models/media/enums'
import {
  generateMediaPublicUrl,
  getMediaThumbnailList,
  uploadToS3,
} from 'Utils/media'
import { VIDEO_QUALITY } from 'Utils/globals'
import { downloadS3Object } from './helper'

const tmpDirPath = path.join(__dirname, '../../../../tmp/')

export const processVideo = async (id, messageObj) => {
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
    await convertOriginalVideo(messageObj)
    const trailer = await generateTrailer(messageObj)
    const qualityVideos = await generateQualityVideos(messageObj)
    const thumbnails = await generateThumbnails(messageObj)
    const meta = await getMeta(messageObj)

    await models.Media.updateOne(
      { _id: id },
      {
        $set: {
          status: MediaStatus.COMPLETED,
          thumbnails,
          trailer,
          quality: qualityVideos,
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
 * @helper
 * Determine if we should convert original video into mp4
 * @param {*} messageObj
 * @returns
 */
const shouldConvertToMp4 = (messageObj) => {
  const { mimetype, fileExt } = messageObj
  const mimetypes = ['video/quicktime', 'video/ogg']
  const fileExts = ['mov', 'ogv']
  return mimetypes.includes(mimetype) || fileExts.includes(fileExt)
}

/**
 * @helper
 * Get the video file path to use as a source
 * @param {*} messageObj
 * @returns {string}
 */
const getOriginalFile = (messageObj) => {
  const { id, fileExt } = messageObj
  // if (shouldConvertToMp4(messageObj)) {
  //   return path.join(tmpDirPath, `${id}_converted.mp4`)
  // } else {
  //   return path.join(tmpDirPath, `${id}.${fileExt}`)
  // }
  return path.join(tmpDirPath, `${id}.${fileExt}`)
}

/**
 * Convert original video into mp4 if needed
 * @param {*} messageObj sqs message object that contains media info
 */
const convertOriginalVideo = async (messageObj) =>
  new Promise(async (resolve, reject) => {
    const { id, mediaType, mediaSubType, ownerId, fileExt } = messageObj
    const tmpOriginalFile = path.join(tmpDirPath, `${id}.${fileExt}`)
    // Converted mp4 file path for original video
    const tmpTargetFilename = `${id}_converted`
    const tmpTargetFilePath = path.join(tmpDirPath, `${tmpTargetFilename}.mp4`)

    if (shouldConvertToMp4(messageObj)) {
      ffmpeg(tmpOriginalFile)
        .format('mp4')
        .on('start', () => {
          console.info('Converting original video into mp4')
        })
        .on('error', (err) => {
          console.error('Failed to convert original video into mp4: ', err)
          reject(err)
        })
        .on('end', async () => {
          console.info(`Converted original video into mp4, Uploading it to s3`)
          const s3Key = await uploadToS3(
            mediaType,
            mediaSubType,
            ownerId,
            tmpTargetFilename,
            'mp4',
            'video/mp4',
            fs.readFileSync(tmpTargetFilePath)
          )
          console.info(`Uploaded converted video to s3`)

          // Update media document by replacing original media with converted one
          await models.Media.updateOne(
            { _id: id },
            {
              $set: {
                mimetype: 'video/mp4',
                originalFilename: `${tmpTargetFilename}.mp4`,
                s3Key,
              },
            }
          )
          resolve()
        })
        .save(tmpTargetFilePath)
    } else {
      resolve()
    }
  })

/**
 * Generate trailer for the original video
 * @param {*} messageObj sqs message object that contains media info
 */
const generateTrailer = async (messageObj) =>
  new Promise(async (resolve, reject) => {
    const { id, mediaType, mediaSubType, ownerId } = messageObj
    const tmpOriginalFile = getOriginalFile(messageObj)
    // Trim original video into trailer using ffmpeg
    const tmpTargetFilename = `${id}_trailer`
    const tmpTargetFilePath = path.join(tmpDirPath, `${tmpTargetFilename}.mp4`)

    ffmpeg(tmpOriginalFile)
      .seekInput(0)
      .duration(15)
      .format('mp4')
      .on('start', () => {
        console.info('Generating a trailer')
      })
      .on('error', (err) => {
        console.error('Failed to generate a trailer: ', err)
        reject(err)
      })
      .on('end', async () => {
        console.info(`Generated a trailer, Uploading it to s3`)
        const trailerS3Key = await uploadToS3(
          mediaType,
          mediaSubType,
          ownerId,
          tmpTargetFilename,
          'mp4',
          'video/mp4',
          fs.readFileSync(tmpTargetFilePath)
        )
        console.info(`Uploaded a trailer to s3`)

        resolve({
          s3Key: trailerS3Key,
          url: generateMediaPublicUrl(id, { trailer: true }),
        })
      })
      .save(tmpTargetFilePath)
  })

/**
 * Generate thumbnails for the original video
 * @param {*} messageObj sqs message object that contains media info
 */
const generateThumbnails = async (messageObj) => {
  const { id, mediaType, mediaSubType } = messageObj
  const thumbnailSizes = getMediaThumbnailList(mediaType, mediaSubType)
  if (!thumbnailSizes.length) {
    console.info(`Media: ${id} does not need any thumbnail yet`)
    return
  }

  let thumbnails = []
  try {
    thumbnails = await Promise.all(
      thumbnailSizes.map((sizeInfo) => uploadThumbnail(messageObj, sizeInfo))
    )
  } catch (err) {
    console.error('Image upload error: ', err)
    throw err
  }
  return thumbnails
}

const uploadThumbnail = async (messageObj, sizeInfo) =>
  new Promise((resolve, reject) => {
    const { mediaType, mediaSubType, id, ownerId } = messageObj

    // Initializing to run ffmpeg command to generate screenshots
    const { name, size } = sizeInfo
    const tmpOriginalFile = getOriginalFile(messageObj)
    const tmpThumbnailFilename = `${id}_${name}.png`
    const ffmpegScreenshotOptions = {
      count: 1,
      filename: tmpThumbnailFilename,
      folder: tmpDirPath,
    }
    ffmpegScreenshotOptions.size = `${size}x?`

    // Running ffmpeg command to generate screenshot for input options
    console.info(`Generating a thumbnail: ${name}`)
    ffmpeg(tmpOriginalFile)
      .screenshots(ffmpegScreenshotOptions)
      .on('error', (err) => {
        console.error(`Failed to generate a thumbnail: ${name}: `, err)
        reject(err)
      })
      .on('end', async () => {
        console.info(`Generated a thumbnail: ${name}, Uploading it to s3`)
        const s3Key = await uploadToS3(
          mediaType,
          mediaSubType,
          ownerId,
          `${id}_${name}`,
          'png',
          'image/png',
          fs.readFileSync(path.join(tmpDirPath, tmpThumbnailFilename))
        )
        console.info(`Uploaded a thumbnail: ${name} to s3`)

        resolve({
          name,
          s3Key,
          url: generateMediaPublicUrl(id, { thumbnail: name }),
        })
      })
  })

/**
 * Generate needed quality video
 * @param {*} messageObj sqs message object that contains media info
 */
const generateQualityVideos = async (messageObj) => {
  const { mediaType, mediaSubType, id, ownerId } = messageObj
  const tmpOriginalFile = getOriginalFile(messageObj)
  const qualityVideos = await Promise.all(
    VIDEO_QUALITY.map(
      ({ name, size }) =>
        new Promise((resolve, reject) => {
          console.info(`Generating a ${name} quality video`)
          const tmpTargetFilename = `${id}_quality_${name}`
          const tmpTargetFilePath = path.join(
            tmpDirPath,
            `${tmpTargetFilename}.mp4`
          )
          ffmpeg(tmpOriginalFile)
            .size(`${size}x?`)
            .format('mp4')
            .on('error', (err) => {
              console.error(`Failed to generate a ${name} quality video: `, err)
              reject(err)
            })
            .on('end', async () => {
              console.info(
                `Generated a ${name} quality video, Uploading it to s3`
              )
              const s3Key = await uploadToS3(
                mediaType,
                mediaSubType,
                ownerId,
                tmpTargetFilename,
                'mp4',
                'video/mp4',
                fs.readFileSync(tmpTargetFilePath)
              )
              console.info(`Uploaded a ${name} quality video to s3`)

              resolve({
                name,
                s3Key,
                url: generateMediaPublicUrl(id, { quality: name }),
              })
            })
            .save(tmpTargetFilePath)
        })
    )
  )
  return qualityVideos
}

export const getVideoOrientationMeta = (metadata) => {
  const { streams } = metadata
  const meta = {}

  const videoStream = streams.find((stream) => stream.codec_type === 'video')
  if (videoStream) {
    meta.width = videoStream.width
    meta.height = videoStream.height

    // Get rotation info from the videoStream
    const rotationInfo = videoStream.rotation || (videoStream.tags || {}).rotate
    if (rotationInfo) {
      const rotation = parseInt(rotationInfo, 10)
      // Android Videos
      switch (rotation) {
        case 90:
        case -90:
        case 270:
        case -270:
          meta.orientation = VideoOrientation.PORTRAIT
          break
        case 0:
        case 180:
        case -180:
        default:
          meta.orientation = VideoOrientation.LANDSCAPE
          break
      }
    } else {
      if (meta.width >= meta.height) {
        meta.orientation = VideoOrientation.LANDSCAPE
      } else {
        meta.orientation = VideoOrientation.PORTRAIT
      }
    }

    // Should swap width and height based on the orientation
    // Android videos have width > height even when rotation is 90 or -90
    if (
      (meta.orientation === VideoOrientation.PORTRAIT &&
        meta.width > meta.height) ||
      (meta.orientation === VideoOrientation.LANDSCAPE &&
        meta.width < meta.height)
    ) {
      // Swap width and height
      const tmp = meta.width
      meta.width = meta.height
      meta.height = tmp
    }
  }
  return meta
}

/**
 * Get meta info from the video
 * @param {*} messageObj sqs message object that contains media info
 */
const getMeta = async (messageObj) =>
  new Promise((resolve, reject) => {
    const tmpOriginalFile = getOriginalFile(messageObj)
    ffmpeg.ffprobe(tmpOriginalFile, (err, metadata) => {
      if (err) {
        console.error(`Failed to get video meta: `, err)
        reject(err)
      }

      const {
        format: { duration, size },
      } = metadata
      let meta = {} // returning meta object
      if (typeof duration === 'number') {
        meta.duration = duration
      }
      if (typeof size === 'number') {
        meta.size = size
      }
      // Detect video orientation
      const orientationMeta = getVideoOrientationMeta(metadata)
      meta = {
        ...meta,
        ...orientationMeta,
      }
      resolve(meta)
    })
  })
