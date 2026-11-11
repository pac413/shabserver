import crypto from 'crypto'
import path from 'path'
import { format } from 'util'
import AWS from 'aws-sdk'
import winston from 'winston'
import WinstonCloudWatch from 'winston-cloudwatch'
require('winston-daily-rotate-file')

const SPLAT = Symbol.for('splat')

const { colorize, combine, errors, printf, timestamp } = winston.format
const formatLogs = combine(
  colorize(),
  timestamp(),
  errors({ stack: true }),
  printf(
    ({ timestamp, level, message, stack, [SPLAT]: args = [] }) =>
      `${timestamp} - ${level}: ${
        stack ? format(message, stack, ...args) : format(message, ...args)
      }`
  )
)

export const getConsoleTransport = () => {
  const consoleTransport = new winston.transports.Console({
    format: formatLogs,
  })

  return consoleTransport
}

export const getFileTransport = (TAG) => {
  const fileTransport = new winston.transports.DailyRotateFile({
    filename: `${TAG}-%DATE%.log`,
    dirname: process.env.LOG_FILE_DIRPATH || path.join(__dirname, '../../logs'),
    datePattern: 'YYYY-MM-DD-HH',
    maxSize: '1M',
    maxFiles: process.env.NODE_ENV === 'develop' ? '1h' : undefined,
    format: formatLogs,
  })

  return fileTransport
}

export const getCloudWatchTransport = (TAG) => {
  const startTime = new Date().toISOString()
  const startHash = crypto.createHash('md5').update(startTime).digest('hex')
  const cloudwatchTransport = new WinstonCloudWatch({
    cloudWatchLogs: new AWS.CloudWatchLogs(),
    logGroupName: `${process.env.CLOUDWATCH_LOG_GROUP_PREFIX}-${TAG}`,
    logStreamName: () => {
      // Spread log streams across dates as the server stays up
      const date = new Date().toISOString().split('T')[0]
      return `shabbat-${TAG}-${date}-${startHash}`
    },
    jsonMessage: true,
  })

  return cloudwatchTransport
}
