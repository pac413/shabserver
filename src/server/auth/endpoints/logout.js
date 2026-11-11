import { eventManager } from 'Events'
import models from 'Models'

/**
 * /api/v2/auth/logout
 */
export default async function (req, res) {
  const { refreshToken } = req.body
  const existingTokenInfo = await models.RefreshToken.findOne({
    token: refreshToken,
  })
  const userId = existingTokenInfo && existingTokenInfo.user
  if (!userId) {
    res.json({ success: true })
    return
  }

  await models.RefreshToken.deleteMany({ token: refreshToken })
  const profiles = await models.Profile.find({ user: userId })
  if (profiles || profiles.length) {
    eventManager.emit(eventManager.events.USER_LOGOUT, profiles[0]._id)
  }

  res.json({ success: true })
}
