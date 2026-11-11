import moment from 'moment'
import { eventManager } from 'Events'

export default async function readMessage(activeProfileId, message) {
  message.recipients = message.recipients.map((r) => {
    if (r.recipient === activeProfileId) {
      r.read = true
      r.readDate = moment.utc().toDate()
    }
    return r
  })

  eventManager.emit(eventManager.events.MESSAGE_READ, message, {
    activeProfileId,
  })

  return message.save()
}
