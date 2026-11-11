import winston from 'winston'
import {
  getCloudWatchTransport,
  getConsoleTransport,
  getFileTransport,
} from './utils'

const setupImportLogger = () => {
  const TAG = process.env.IMPORT ? 'import' : 'migrate'
  const transports =
    process.env.NODE_ENV === 'local'
      ? {
          console: getConsoleTransport(),
          report: getFileTransport(TAG + '-report'),
          other: getFileTransport(TAG),
        }
      : {
          console: getConsoleTransport(),
          report: getCloudWatchTransport(TAG + '-report'),
          other: getCloudWatchTransport(TAG),
        }
  const logger = winston.createLogger({
    level: 'debug',
    levels: winston.config.syslog.levels,
    transports: [transports.console, transports.report, transports.other],
  })
  winston.addColors(winston.config.syslog.colors)
  transports.report.level = 'alert'

  console.error = (message, ...args) => logger.error(message, ...args)
  console.info = (message, ...args) => logger.info(message, ...args)
  console.warn = (message, ...args) => logger.warn(message, ...args)
  console.log = (message, ...args) => logger.log('info', message, ...args)

  return logger
}

export const importLogger = setupImportLogger()
