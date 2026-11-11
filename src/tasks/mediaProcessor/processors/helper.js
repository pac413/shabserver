import fs from 'fs'
import path from 'path'
import { AWS } from 'Services'

export const downloadS3Object = (messageObj, tmpDirPath) =>
  new Promise((resolve, reject) => {
    const { id, bucket, s3Key, fileExt } = messageObj
    // Save s3 object into a writable stream to a tmp file
    console.info('Downloading original media from s3 as a tmp file')
    const tmpOriginalFile = path.join(tmpDirPath, `/${id}.${fileExt}`)
    const s3 = AWS.getS3Client()

    s3.getObject({
      Bucket: bucket,
      Key: s3Key,
    })
      .promise()
      .then((data) => {
        fs.writeFile(tmpOriginalFile, data.Body, (error) => {
          if (error) {
            console.error('Failed to save original media', error)
            reject(error)
          } else {
            console.info('Saved original media as a tmp file')
            resolve()
          }
        })
      })
      .catch((err) => {
        console.error('Failed to get s3 object', err)
        reject(err)
      })
  })
