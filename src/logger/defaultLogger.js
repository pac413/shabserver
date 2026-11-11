import winston from 'winston'
import {
  getCloudWatchTransport,
  getConsoleTransport,
  getFileTransport,
} from './utils'

const setupDefaultLogger = () => {
  const transports =
    process.env.NODE_ENV === 'local'
      ? [getConsoleTransport(), getFileTransport('server')]
      : [getConsoleTransport(), getCloudWatchTransport('server')]
  const logger = winston.createLogger({ transports })

  console.error = (message, ...args) =>
    message instanceof Error
      ? logger.error(message.message, ...args)
      : logger.error(message, ...args)
  console.info = (message, ...args) => logger.info(message, ...args)
  console.warn = (message, ...args) => logger.warn(message, ...args)
  console.log = (message, ...args) => logger.log('info', message, ...args)

  return logger
}

export const defaultLogger = setupDefaultLogger()
