import { respondNotFoundError } from 'Errors/rest'
import models from 'Models'

export function setupMobileAppVersionEndpoint(app) {
  app.get('/api/app/versions/latest', async (req, res, next) => {
    const { platform } = req.query
    const latestVersion = await models.MobileAppVersion.findOne({
      platform,
    })
      .sort({ releaseDate: -1 })
      .lean()
    if (!latestVersion) {
      return respondNotFoundError(req, res)
    }
    return res.json(latestVersion)
  })
}
