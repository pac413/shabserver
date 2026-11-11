import fs from 'fs'
import path from 'path'
import AWS from 'aws-sdk'
import dotenv from 'dotenv'
import { S3_SIGNED_URL_EXPIRATION } from 'Utils/globals'

dotenv.config()
// *********************************************************************
// We need to make sure these services are only instantiated when needed
// *********************************************************************

AWS.config.setPromisesDependency(require('bluebird'))

export const awsAccessKeyId = process.env.AWS_ACCESS_KEY_ID
export const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY
export const awsRegion = process.env.AWS_REGION
export const awsAccountId = process.env.AWS_ACCOUNT_ID
export const awsS3Bucket = process.env.AWS_MEDIA_S3_BUCKET_NAME
export const awsCloudfrontDomainName = process.env.AWS_CLOUDFRONT_DOMAIN_NAME
export const awsCloudfrontAccessKeyId = process.env.AWS_CLOUDFRONT_ACCESS_KEY_ID

export const getS3Client = () => new AWS.S3({ signatureVersion: 'v4' })

export const getSQSClient = () =>
  new AWS.SQS({
    awsRegion,
    apiVersion: '2012-11-05',
  })

export const getMediaSQSQueueUrl = () => {
  return `https://sqs.${awsRegion}.amazonaws.com/${awsAccountId}/${process.env.AWS_MEDIA_SQS_QUEUE_NAME}`
}

export const getWorkerSQSQueueUrl = () => {
  return `https://sqs.${awsRegion}.amazonaws.com/${awsAccountId}/${process.env.AWS_WORKER_SQS_QUEUE_NAME}`
}

export const getS3Url = (key) => {
  return `https://${awsS3Bucket}.s3.${awsRegion}.amazonaws.com/${key}`
}

export const getCfPublicUrl = (s3Key) =>
  `https://${awsCloudfrontDomainName}/${s3Key}`

export const getCfSignedUrl = (s3Key) => {
  const awsCloudfrontPrivateKey = fs
    .readFileSync(path.join(__dirname, '../secretKeys/cf-pk.pem'), 'utf8')
    .toString()
  const signer = new AWS.CloudFront.Signer(
    awsCloudfrontAccessKeyId,
    awsCloudfrontPrivateKey
  )
  const twoDays = S3_SIGNED_URL_EXPIRATION * 1000
  const signedUrl = signer.getSignedUrl({
    url: `https://${awsCloudfrontDomainName}/${s3Key}`,
    expires: Math.floor((Date.now() + twoDays) / 1000), // Unix UTC timestamp for now + 2 days
  })
  return signedUrl
}

export const generateMediaS3Key = ({
  mediaType,
  mediaSubType,
  ownerId,
  id,
  fileExt,
}) => {
  return `${mediaType}/${mediaSubType}/${ownerId}/${id}.${fileExt}`
}
