import { restoreAccount } from 'Connectors/user'
import { ERRORS_BY_CODE } from 'Errors'
import { respondUnauthenticatedError } from 'Errors/rest'
import models from 'Models'
import { ProfileStatuses } from 'Models/profile/enums'

/**
 * /api/v2/auth/restore-account
 */
export default async function (req, res) {
  try {
    const profile = await models.Profile.findOne({ user: req.user._id })
    if (!profile) {
      respondUnauthenticatedError(req, res, ERRORS_BY_CODE.INVALID_CREDENTIALS)
      return
    }

    if (profile.accountStatus === ProfileStatuses.DELETED) {
      const { success } = await restoreAccount(profile.id)
      res.json({ success })
    } else {
      res.json({ success: false })
    }
  } catch (error) {
    res.json({ success: false })
  }
}
