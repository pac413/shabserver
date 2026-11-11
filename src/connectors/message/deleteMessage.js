import moment from 'moment'
import { eventManager } from 'Events'
import { Roles } from 'Utils/globals'

export default async function deleteMessage(message, context) {
  const ctx = {}
  if (message.sender === context.activeProfileId) {
    message.senderDeleted = {
      deleted: true,
      date: moment.utc().toDate(),
    }
    ctx.senderDeleted = true
    await message.save()
    eventManager.emit(eventManager.events.MESSAGE_DELETED, message, ctx)
  } else if (context.role === Roles.Admin) {
    await message.delete()
  } else {
    message.recipients = message.recipients.map((r) => {
      if (r.recipient === context.activeProfileId) {
        r.deleted = true
        r.deletedDate = moment.utc().toDate()
        ctx.recipientsDeleted = true
        ctx.recipient = context.activeProfileId
      }
      return r
    })
    await message.save()
    eventManager.emit(eventManager.events.MESSAGE_DELETED, message, ctx)
  }
}
