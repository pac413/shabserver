import { AWS } from 'Services'
import request from 'request'

export const uploadRemoteFile = (url, key, isPublic = false) => {
  const s3 = AWS.getS3Client()

  return new Promise((resolve, reject) => {
    request(
      {
        url: url,
        encoding: null,
      },
      (err, res, body) => {
        if (err || !res) {
          reject(err)
          return
        }
        const objectParams = {
          Bucket: AWS.awsS3Bucket,
          Key: key,
          ACL: isPublic ? 'public-read' : 'bucket-owner-full-control',
          ContentType: res.headers['content-type'],
          ContentLength: res.headers['content-length'],
          Body: body,
        }
        resolve(
          s3
            .upload(objectParams)
            .promise()
            .then((data) => data.Location)
        )
      }
    )
  })
}

export const copyS3Object = (srcKey, dstKey, isPublic = false) => {
  const s3 = AWS.getS3Client()
  return s3
    .copyObject({
      Bucket: AWS.awsS3Bucket,
      CopySource: `/${AWS.awsS3Bucket}/${srcKey}`,
      Key: dstKey,
      ACL: isPublic ? 'public-read' : 'bucket-owner-full-control',
    })
    .promise()
}
