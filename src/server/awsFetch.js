import AWS from 'aws-sdk'
import dotenv from 'dotenv'

dotenv.config()

const { NODE_ENV, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } =
  process.env
const secretName = `shabbat-server-${NODE_ENV}`

// Configure AWS SDK
AWS.config.update({
  accessKeyId: AWS_ACCESS_KEY_ID,
  secretAccessKey: AWS_SECRET_ACCESS_KEY,
  region: AWS_REGION,
})

// Create a Secrets Manager client
const client = new AWS.SecretsManager({
  region: AWS_REGION,
})

// Set secrets from AWS Secret Manager into process.env
const setEnvVariable = (aws) => {
  const awsKeys = JSON.parse(aws)
  process.env = {
    ...awsKeys,
    ...process.env,
  }

  // Convert variables into integer
  const envVariableNames = [
    'AWS_PRESIGNED_URL_EXPIRATION',
    'PORT',
    'JWT_EXPIRES',
    'RESET_PASSWORD_EXPIRES',
    'REDIS_PORT',
    'HIGH_MIN_FRAUD_SCORE',
    'IP_RISK_SCORE',
    'PRERENDER_PORT',
  ]
  envVariableNames.forEach(
    (key) => (process.env[key] = parseInt(process.env[key]))
  )
}

export default async () => {
  console.info('Fetching environment variables...')
  const data = await new Promise((resolve) => {
    client.getSecretValue({ SecretId: secretName }, function (err, data) {
      if (err) {
        console.log(err)
        if (err.code === 'DecryptionFailureException')
          // Secrets Manager can't decrypt the protected secret text using the provided KMS key.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err
        else if (err.code === 'InternalServiceErrorException')
          // An error occurred on the server side.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err
        else if (err.code === 'InvalidParameterException')
          // You provided an invalid value for a parameter.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err
        else if (err.code === 'InvalidRequestException')
          // You provided a parameter value that is not valid for the current state of the resource.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err
        else if (err.code === 'ResourceNotFoundException')
          // We can't find the resource that you asked for.
          // Deal with the exception here, and/or rethrow at your discretion.
          throw err
      } else {
        // Decrypts secret using the associated KMS CMK.
        // Depending on whether the secret is a string or binary, one of these fields will be populated.
        if ('SecretString' in data) {
          const secret = data.SecretString
          resolve(secret)
        } else {
          const buff = Buffer.from(data.SecretBinary, 'base64')
          const decodedBinarySecret = buff.toString('ascii')
          resolve(decodedBinarySecret)
        }
      }
    })
  })
  setEnvVariable(data)

  // Set expiration date for refresh token
  process.env.REFRESH_TOKEN_EXPIRE = 21 // day
  console.info('Environment variables set...')
}
