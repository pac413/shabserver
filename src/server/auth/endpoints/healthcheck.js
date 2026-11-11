import mongoose from 'mongoose'
import { Cache } from 'Services/cache'

/**
 * /api/healthcheck
 */
export default async function (req, res) {
  const healthcheck = {
    uptime: process.uptime(),
    responsetime: process.hrtime(),
    message: 'ok',
    timestamp: Date.now(),
    integrations: {
      redis: 'ok',
      mongodb: 'ok',
    },
  }

  try {
    // Redis healthcheck
    const pong = await Cache.ping()
    if (pong !== 'PONG') {
      healthcheck.integrations.redis = 'error'
    }

    /**
     * Mongoose healthcheck
     * - 0 = disconnected
     * - 1 = connected
     * - 2 = connecting
     * - 3 = disconnecting
     */
    const statusMsg = [
      'disconnected',
      'connected',
      'connecting',
      'disconnecting',
    ]
    const mongooseStatus = mongoose.connection.readyState
    if (mongooseStatus !== 1) {
      healthcheck.integrations.mongodb = statusMsg[mongooseStatus]
    }
  } catch (error) {
    healthcheck.message = error

    return res.status(503).send(healthcheck)
  } finally {
    healthcheck.responsetime = process.hrtime()

    if (
      healthcheck.message === 'ok' &&
      healthcheck.integrations.redis === 'ok' &&
      healthcheck.integrations.mongodb === 'ok'
    ) {
      res.send(healthcheck)
    } else {
      res.status(503).send(healthcheck)
    }
  }
}
