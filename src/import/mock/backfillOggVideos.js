/**
 * One-time usage backfiller
 * Converts existing ogg videos into mp4 and update the media documents
 */
import fs from 'fs'
import path from 'path'
import ffmpeg from 'fluent-ffmpeg'
import mime from 'mime'
import models from 'Models'
import { MediaStatus } from 'Models/media/enums'
import { AWS } from 'Services'
import { uploadToS3 } from 'Utils/media'
import { downloadS3Object } from '../../tasks/mediaProcessor/processors/helper'

const args = process.argv.slice(2)
const batchSize = parseInt(args[0], 10)
const page = parseInt(args[1], 10) || 0
const tmpDirPath = path.join(__dirname, '../../../tmp/')

const convertToMp4 = async (media) =>
  new Promise((resolve, reject) => {
    const { _id: id, mediaType, mediaSubType, ownerId } = media
    const fileExt = mime.getExtension(media.mimetype)

    const tmpOriginalFile = path.join(tmpDirPath, `${id}.${fileExt}`)
    // Converted mp4 file path for original video
    const tmpTargetFilename = `${id}_converted`
    const tmpTargetFilePath = path.join(tmpDirPath, `${tmpTargetFilename}.mp4`)

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

        resolve({
          s3Key,
          fileName: `${tmpTargetFilename}.mp4`,
        })
      })
      .save(tmpTargetFilePath)
  })

export const backfillOggVideos = async () => {
  console.log('Converting ogg to mp4 & updating media documents...')

  // STEP 1: Query all media documents to backfill
  const mediaArrayToBackfill = await models.Media.find({
    $or: [{ mimetype: 'video/ogg' }, { fileExt: 'ogv' }],
  })
    .sort({ createdAt: 1 })
    .limit(batchSize)
    .skip(page * batchSize)

  // STEP 2: Create a tmp folder to download video files locally
  try {
    fs.mkdirSync(tmpDirPath, { recursive: true })
  } catch (err) {
    console.log('Failed to create a tmp folder for ffmpeg commands: ', err)
  }

  let success = 0
  let failure = 0

  for (const media of mediaArrayToBackfill) {
    try {
      // STEP 3.1: Update media status to PROCESSING
      media.status = MediaStatus.PROCESSING
      await media.save({ timestamps: false })

      // STEP 3.2: Download video into local tmp directory
      const messageObj = {
        id: media._id,
        bucket: AWS.awsS3Bucket,
        fileExt: mime.getExtension(media.mimetype),
        s3Key: media.s3Key,
      }
      await downloadS3Object(messageObj, tmpDirPath)

      // STEP 3.3: Convert the downloaded video into mp4
      const { s3Key, fileName } = await convertToMp4(media)

      // STEP 3.4: Update media document by replacing original media with converted one
      media.mimetype = 'video/mp4'
      media.originalFilename = fileName
      media.s3Key = s3Key
      await media.save({ timestamps: false })

      success += 1
      console.log(`Successfully backfilled a media: ${media._id}`)
    } catch (error) {
      failure += 1
      console.log(`Failed to backfill a media: ${media._id}`, error)
    } finally {
      // STEP 3.5: Updating media status back to COMPLETED
      media.status = MediaStatus.COMPLETED
      await media.save({ timestamps: false })

      // STEP 3.6: Delete all tmp files
      fs.readdirSync(tmpDirPath)
        .filter((file) => file.includes(media._id))
        .map((file) => fs.unlinkSync(path.join(tmpDirPath, file)))
    }
  }

  console.log(
    `Total: ${mediaArrayToBackfill.length}, Success: ${success}, Failure: ${failure}`
  )
}
