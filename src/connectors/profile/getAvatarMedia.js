import mediaLoader from 'DataLoaders/mediaLoader'

export default async function getAvatarMedia(profile) {
  const { avatar } = profile
  if (avatar) {
    return mediaLoader.load(avatar)
  }
  return null
}
