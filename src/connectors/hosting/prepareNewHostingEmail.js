import hostingEmailParts from './hostingEmailParts'

export default async function prepareNewHostingEmail(hosting) {
  const { body } = await hostingEmailParts(hosting)
  return { ...body }
}
