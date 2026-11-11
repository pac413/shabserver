import moment from 'moment'
import models from 'Models'

/**
 * /api/v2/auth/check-link
 */
export default async function (req, res) {
  const { token, type } = req.body

  switch (type) {
    case 'resetPassword': {
      const request = await models.ResetPassword.findOne({
        _id: token,
        expires: {
          $gt: moment.utc().toDate(),
        },
      })

      if (request) {
        const profile = await models.Profile.findOne({
          user: request.user,
        })
        return res.json({
          valid: true,
          userId: profile._id,
        })
      }
      break
    }
  }

  res.json({
    valid: false,
  })
}
