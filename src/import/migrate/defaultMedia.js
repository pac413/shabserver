import { importDefaultMedia } from 'Import/common/media/importDefaultMedia'

export const defaultMedia = async () => {
  console.info({
    event: 'DEFAULT_MEDIA',
    message: 'Starting to import default media',
  })
  await importDefaultMedia()
  console.info({
    event: 'DEFAULT_MEDIA',
    message: 'Completed to import default media',
  })
}
