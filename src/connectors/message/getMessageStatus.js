export default async function getMessageStatus(message) {
  const read = message.recipients[0].read
  const sent = (message.status = !!'sent')
  const dateSent = message.dateSent
  const dateRead = message.recipients[0].readDate

  const status = {
    status: read ? 'read' : sent ? 'sent' : 'pending',
    dateSent,
    dateRead,
  }

  return status
}
