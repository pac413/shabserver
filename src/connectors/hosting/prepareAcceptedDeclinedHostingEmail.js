import hostingEmailParts from './hostingEmailParts'

export default async function prepareAcceptedDeclinedHostingEmail(hostingId) {
  const { sender, body } = await hostingEmailParts(hostingId, true)
  return {
    email: sender.email,
    phone: sender.phone,
    ...body,
  }
}
