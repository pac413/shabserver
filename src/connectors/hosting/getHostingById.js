import models from 'Models'

export default async function getHostingById(hostingId, context) {
  const { activeProfileId } = context

  const hosting = await models.Hosting.findById(hostingId)
  if (!hosting) {
    return null
  }

  if (hosting.host === activeProfileId || hosting.guest === activeProfileId) {
    return hosting
  }
  return null
}
