import { importLogger as logger } from 'Logger/importLogger'
import models from 'Models'
import { generateHandle } from 'Utils'

export const updateProfileHandles = async () => {
  const cursor = models.Profile.find({
    handle: {
      $regex:
        /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    },
  }).cursor()

  let index = 0
  for await (const profile of cursor) {
    index++
    try {
      const handle = await generateHandle(profile.firstName, profile.lastName)

      await models.Profile.updateOne(
        {
          _id: profile._id,
        },
        {
          $set: { handle },
        }
      )
      console.info({
        event: 'UPDATE_PROFILE_HANDLES',
        message: `${index}: Updated profile ${profile._id}'s handle to ${handle}`,
        index,
        profileId: profile._id,
      })
    } catch (err) {
      const message = `${index}: Profile handle update for ${profile._id} failed`

      console.error({
        event: 'UPDATE_PROFILE_HANDLES',
        message,
        index,
        profileId: profile._id,
        err,
      })
      logger.alert({
        event: 'UPDATE_PROFILE_HANDLES',
        status: 'failed',
        message,
        index,
        profileId: profile._id,
        err,
      })
    }
  }
}
