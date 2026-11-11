import moment from 'moment'
import models from 'Models'

export const resetActivelyLooking = async () => {
  await models.Profile.updateMany(
    {
      'activelyLooking.guest': true,
      'activelyLooking.guestExpire': { $lt: moment().utc().toDate() },
    },
    { 'activelyLooking.guest': false }
  )
}
