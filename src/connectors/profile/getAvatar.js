import models from 'Models'

export default async function getAvatar(profile, size) {
  const { avatar } = profile
  if (avatar) {
    const media = await models.Media.findById(avatar).lean()
    if (media) {
      const thumbnail = media.thumbnails.find((item) => item.name === size)
      if (thumbnail) {
        return thumbnail.url
      } else {
        return media.originalUrl
      }
    }
  }
  return ''
}
