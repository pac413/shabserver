import { eventManager } from 'Events'
import models from 'Models'

export default async function updateMedia(input) {
  const { id, ...mediaParams } = input
  const media = await models.Media.findOneAndUpdate(
    { _id: id },
    { ...mediaParams },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  // emit MEDIA_UPDATED event
  eventManager.emit(eventManager.events.MEDIA_UPDATED, {
    media,
    event: eventManager.events.MEDIA_UPDATED,
  })
  return media
}
